import { useEffect, useState, useRef, useCallback } from "react";
import { chatApi } from "../api/chatApi.js";
import { useAppContext } from "../context/AppContext.jsx";
import io from "socket.io-client";
import { Check, Paperclip, Send, X, Loader } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ChatWindow — polished WhatsApp-like UI preserving original functionality.
 *
 * Notes:
 * - Uses a single shared socket instance (same as before).
 * - Keeps tmp_ message flow, retry, status icons, read/delivered updates.
 * - Attachment button opens file picker and sends a placeholder message
 *   (📎 filename). If you add a real upload API later, plug it into
 *   the `handleAttachFile` function where commented.
 */

const SOCKET_URL =
  import.meta.env.VITE_BACKEND_URL ||
  "https://service-finder-qcj8.onrender.com"; // ✅ fallback to live backend

// module-level socket (shared across components)
const socket = io(SOCKET_URL, { autoConnect: true });

function timeShort(timestamp) {
  try {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function dayLabel(ts) {
  const d = new Date(ts);
  const today = new Date();
  if (
    d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate()
  )
    return "Today";
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (
    d.getFullYear() === yesterday.getFullYear() &&
    d.getMonth() === yesterday.getMonth() &&
    d.getDate() === yesterday.getDate()
  )
    return "Yesterday";
  return d.toLocaleDateString();
}

export default function ChatWindow({ booking, onClose }) {
  const { user } = useAppContext();

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [typing, setTyping] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const scrollRef = useRef();
  const inputRef = useRef();
  const fileInputRef = useRef();
  const processedMsgIdsRef = useRef(new Set());
  const typingTimeoutRef = useRef(null);

  // emit typing (debounced)
  const emitTyping = useCallback(() => {
    if (!booking || !booking._id) return;
    socket.emit("chat:typing", {
      bookingId: booking._id,
      from: user._id || user.id,
    });
    setTyping(true);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
      socket.emit("chat:stopTyping", {
        bookingId: booking._id,
        from: user._id || user.id,
      });
    }, 1200);
  }, [booking, user]);

  const scrollToBottom = (delay = 60) =>
    setTimeout(() => {
      try {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight + 200;
        }
      } catch (e) {}
    }, delay);

  const renderStatusIcon = (status) => {
    if (status === "sending")
      return <Loader className="w-4 h-4 animate-spin inline" />;
    if (status === "sent")
      return <Check className="w-4 h-4 text-gray-300 inline" />;
    if (status === "delivered")
      return (
        <span className="inline-flex -space-x-1">
          <Check className="w-4 h-4 text-green-400 inline" />
          <Check className="w-4 h-4 text-green-400 inline" />
        </span>
      );
    if (status === "read")
      return (
        <span className="inline-flex -space-x-1">
          <Check className="w-4 h-4 text-sky-500 inline" />
          <Check className="w-4 h-4 text-sky-500 inline" />
        </span>
      );
    if (status === "failed") return <span className="text-red-500">❌</span>;
    return null;
  };

  const getReceiverId = () => {
    if (user.role === "client") {
      return String(booking.worker?.user?._id || booking.worker?._id || "");
    } else {
      return String(booking.client?._id || booking.client || "");
    }
  };

  // ----- load messages & setup socket listeners -----
  useEffect(() => {
    setMessages([]);
    processedMsgIdsRef.current = new Set();
    setError(null);
    setLoading(true);

    if (!booking || !booking._id) {
      setError("Invalid booking selected for chat.");
      setLoading(false);
      return;
    }

    if (!["accepted", "arrived", "completed"].includes(booking.status)) {
      setError("Chat is available only after the worker accepts the booking.");
      setLoading(false);
      return;
    }

    let mounted = true;

    const fetchMessages = async () => {
      try {
        const res = await chatApi.getMessages(booking._id);
        if (!mounted) return;
        const msgs = res.data?.data || [];
        const ids = new Set(msgs.map((m) => String(m._id)));
        processedMsgIdsRef.current = ids;
        setMessages(msgs);
        scrollToBottom(60);
        setTimeout(() => inputRef.current?.focus?.(), 120);
      } catch (err) {
        console.error("Failed to load messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
    socket.emit("joinChat", booking._id);

    const handleNewMsg = (msg) => {
      try {
        const bookingId =
          typeof msg.booking === "object"
            ? msg.booking._id || msg.booking
            : msg.booking;
        if (String(bookingId) !== String(booking._id)) return;

        const serverId = String(msg._id);
        if (processedMsgIdsRef.current.has(serverId)) return;

        const isMine = String(msg.sender?._id) === String(user._id || user.id);

        setMessages((prev) => {
          if (prev.some((m) => String(m._id) === serverId)) {
            processedMsgIdsRef.current.add(serverId);
            return prev;
          }

          if (isMine) {
            const tmpIndex = prev.findIndex(
              (m) =>
                String(m.sender?._id) === String(msg.sender?._id) &&
                m._id?.toString().startsWith("tmp_") &&
                m.message === msg.message
            );
            if (tmpIndex !== -1) {
              const newArr = [...prev];
              newArr[tmpIndex] = msg;
              processedMsgIdsRef.current.add(serverId);
              return newArr;
            }
          }

          processedMsgIdsRef.current.add(serverId);
          return [...prev, msg];
        });

        scrollToBottom();
        if (!isMine) {
          socket.emit("chat:readOne", {
            bookingId: booking._id,
            msgId: msg._id,
          });
        }
      } catch (ex) {
        console.error("handleNewMsg error:", ex);
      }
    };

    const handleUpdate = ({ msgId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(msgId) ? { ...m, status } : m
        )
      );
    };

    const handleBulkUpdate = ({ bookingId, status }) => {
      if (String(bookingId) !== String(booking._id)) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (status === "read" && m.status !== "read")
            return { ...m, status: "read" };
          if (status === "delivered" && m.status === "sent")
            return { ...m, status: "delivered" };
          return m;
        })
      );
    };

    const handleTyping = ({ bookingId, from }) => {
      if (String(bookingId) !== String(booking._id)) return;
      if (String(from) === String(user._id || user.id)) return;
      setTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => setTyping(false), 1200);
    };

    const handleStopTyping = () => setTyping(false);

    socket.on("chat:new", handleNewMsg);
    socket.on("chat:update", handleUpdate);
    socket.on("chat:updateBulk", handleBulkUpdate);
    socket.on("chat:typing", handleTyping);
    socket.on("chat:stopTyping", handleStopTyping);

    socket.emit("chat:read", booking._id);

    return () => {
      mounted = false;
      socket.off("chat:new", handleNewMsg);
      socket.off("chat:update", handleUpdate);
      socket.off("chat:updateBulk", handleBulkUpdate);
      socket.off("chat:typing", handleTyping);
      socket.off("chat:stopTyping", handleStopTyping);
      socket.emit("leaveChat", booking._id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [booking, user]);

  // send message (supports retry)
  const sendMessage = async (retryTempId = null) => {
    let payloadText;
    if (retryTempId) {
      payloadText = messages.find(
        (m) => String(m._id) === String(retryTempId)
      )?.message;
    } else {
      payloadText = text;
    }

    if (!payloadText || !payloadText.trim()) return;
    setIsSending(true);

    let tempMsg;
    if (retryTempId) {
      tempMsg = {
        ...messages.find((m) => String(m._id) === String(retryTempId)),
      };
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(retryTempId)
            ? { ...m, status: "sending" }
            : m
        )
      );
    } else {
      tempMsg = {
        _id: `tmp_${Date.now()}`,
        booking: booking._id,
        message: payloadText.trim(),
        sender: { _id: user._id || user.id, name: user.name },
        createdAt: new Date().toISOString(),
        status: "sending",
        _isTemp: true,
      };
      setMessages((prev) => [...prev, tempMsg]);
      setText("");
      setTimeout(() => inputRef.current?.focus?.(), 50);
      scrollToBottom();
    }

    try {
      const receiverId = getReceiverId();
      const res = await chatApi.sendMessage(booking._id, {
        receiverId,
        message: tempMsg.message,
      });
      const serverMsg = res.data.data;
      const serverId = String(serverMsg._id);

      processedMsgIdsRef.current.add(serverId);

      setMessages((prev) => {
        const tmpIndex = prev.findIndex(
          (m) => String(m._id) === String(tempMsg._id)
        );
        if (tmpIndex !== -1) {
          const newArr = [...prev];
          newArr[tmpIndex] = serverMsg;
          return newArr;
        }
        if (!prev.some((m) => String(m._id) === serverId)) {
          return [...prev, serverMsg];
        }
        return prev;
      });

      socket.emit("chat:delivered", serverId);
      scrollToBottom();
    } catch (err) {
      console.error("Send message error:", err);
      setMessages((prev) =>
        prev.map((m) =>
          String(m._id) === String(tempMsg._id) ? { ...m, status: "failed" } : m
        )
      );
      toast.error("Message failed to send. Retry available.");
    } finally {
      setIsSending(false);
    }
  };

  const retryMessage = (tempId) => sendMessage(tempId);

  const onInputChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleAttachClick = () => {
    if (!fileInputRef.current) return;
    fileInputRef.current.value = null;
    fileInputRef.current.click();
  };

  const handleFileSelected = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const placeholder = `📎 ${file.name}`;
    setText(placeholder);
    setTimeout(() => sendMessage(), 60);
    toast.success(
      "Attachment sent as placeholder. Add upload API to enable real files."
    );
  };

  const grouped = [];
  let lastDate = null;
  messages.forEach((m) => {
    const label = dayLabel(m.createdAt);
    if (label !== lastDate) {
      grouped.push({
        type: "day",
        label,
        id: `day_${label}_${Math.random().toString(36).slice(2)}`,
      });
      lastDate = label;
    }
    grouped.push({ type: "msg", msg: m });
  });

  if (loading)
    return (
      <div className="fixed bottom-0 right-0 w-full sm:w-96 p-4 bg-white shadow-lg z-50 rounded-t-xl">
        <div className="flex items-center gap-3">
          <Loader className="w-5 h-5 animate-spin text-sky-500" />
          <span className="text-sm text-gray-600">Loading chat...</span>
          <div className="ml-auto">
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="fixed bottom-0 right-0 w-full sm:w-96 bg-white shadow-lg border rounded-t-xl flex flex-col z-50">
        <div className="flex justify-between items-center p-3 border-b bg-gradient-to-r from-sky-500 to-purple-600 text-white rounded-t-xl shadow">
          <h3 className="font-bold">💬 Chat</h3>
          <button
            onClick={onClose}
            className="hover:text-red-300 transition-colors"
            aria-label="Close chat"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 text-sm text-gray-600">{error}</div>
      </div>
    );

  const otherName =
    user.role === "client"
      ? booking.worker?.user?.name || "Worker"
      : booking.client?.name || "Client";
  const otherAvatar =
    user.role === "client"
      ? booking.worker?.profileImage || booking.worker?.user?.avatar
      : booking.client?.avatar;

  return (
    <div className="fixed bottom-0 right-0 w-full sm:w-[420px] max-h-[86vh] flex flex-col bg-white shadow-2xl border rounded-t-2xl z-50">
      {/* Header */}
      <div className="flex items-center gap-3 p-3 border-b">
        <div className="w-11 h-11 rounded-full overflow-hidden bg-slate-100 flex items-center justify-center border-2 border-sky-400">
          {otherAvatar ? (
            <img
              src={otherAvatar}
              alt={otherName}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "/default-avatar.png")}
            />
          ) : (
            <div className="text-sm font-semibold text-sky-600">
              {(otherName || "W").slice(0, 2)}
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-semibold truncate">{otherName}</div>
            <div className="text-xs text-gray-400 ml-1">•</div>
            <div className="text-xs text-gray-400">
              Booking #{String(booking._id).slice(-6)}
            </div>
          </div>
          <div className="text-xs text-gray-500">
            {typing ? (
              <span className="italic">typing...</span>
            ) : booking?.status === "accepted" ? (
              "Online"
            ) : (
              booking?.status
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-100"
            aria-label="Close chat"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-white to-gray-50"
      >
        {grouped.length === 0 && (
          <p className="text-center text-gray-400">
            No messages yet — start the conversation
          </p>
        )}

        {grouped.map((g) => {
          if (g.type === "day") {
            return (
              <div key={g.id} className="flex items-center justify-center">
                <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                  {g.label}
                </div>
              </div>
            );
          }
          const m = g.msg;
          const senderId = m.sender?._id || m.sender?.id;
          const isMine = String(senderId) === String(user._id || user.id);

          return (
            <div
              key={m._id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[82%] flex flex-col ${
                  isMine ? "items-end" : "items-start"
                }`}
              >
                <div
                  className={`px-4 py-2 rounded-2xl break-words shadow-sm ${
                    isMine
                      ? "bg-gradient-to-r from-sky-500 to-sky-600 text-white rounded-br-none"
                      : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <div className="text-sm whitespace-pre-wrap">{m.message}</div>
                </div>

                <div
                  className={`mt-1 text-[11px] flex items-center gap-2 ${
                    isMine
                      ? "text-right text-gray-200"
                      : "text-left text-gray-500"
                  }`}
                >
                  <span
                    className={`${isMine ? "text-gray-100" : "text-gray-400"}`}
                  >
                    {timeShort(m.createdAt)}
                  </span>
                  {isMine && (
                    <span className="ml-1">{renderStatusIcon(m.status)}</span>
                  )}
                  {m.status === "failed" && isMine && (
                    <button
                      onClick={() => retryMessage(m._id)}
                      className="ml-2 px-2 py-0.5 bg-white/10 text-xs rounded hover:bg-white/20"
                    >
                      Retry
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Input & Attach */}
      <div className="p-3 border-t bg-white">
        <div className="flex items-center gap-2">
          <button
            onClick={handleAttachClick}
            className="p-2 rounded-full hover:bg-gray-100"
            title="Attach"
            aria-label="Attach file"
            type="button"
          >
            <Paperclip className="w-5 h-5 text-gray-500" />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelected}
          />

          <input
            ref={inputRef}
            value={text}
            onChange={onInputChange}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                if (!isSending) sendMessage();
              }
            }}
            placeholder="Type a message"
            aria-label="Message input"
            className="flex-1 border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
          />

          <button
            onClick={() => {
              if (!isSending) sendMessage();
            }}
            className="ml-2 bg-gradient-to-r from-sky-500 to-purple-600 p-2 rounded-full shadow-md hover:brightness-105"
            title="Send"
            aria-label="Send message"
            type="button"
          >
            <Send className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
          <div>{isSending ? "Sending..." : ""}</div>
        </div>
      </div>
    </div>
  );
}
