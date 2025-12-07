import { useRef, useEffect, useState, useContext } from "react";
import { SocketContext } from "../context/SocketContext";

export default function Whiteboard({ partyId }) {
  const canvasRef = useRef(null);
  const socket = useContext(SocketContext);

  // drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [ctx, setCtx] = useState(null);
  const prevPosRef = useRef({ x: 0, y: 0 });

  // UI tools
  const [color, setColor] = useState("cyan");
  const [lineWidth, setLineWidth] = useState(3);

  // Initialize / resize canvas
  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const parent = canvas.parentElement;
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;

    if (ctx) {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.lineCap = "round";
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    setCtx(context);
    resizeCanvas();

    context.strokeStyle = color;
    context.lineWidth = lineWidth;
    context.lineCap = "round";

    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  // When tool settings change, update ctx live
  useEffect(() => {
    if (!ctx) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;
  }, [color, lineWidth, ctx]);

  // RECEIVE strokes + clear from server
  useEffect(() => {
    if (!socket || !ctx) return;

    const drawStroke = (stroke) => {
      ctx.beginPath();
      ctx.moveTo(stroke.prevX, stroke.prevY);
      ctx.lineTo(stroke.x, stroke.y);
      ctx.stroke();
    };

    const handleState = ({ strokes }) => {
      if (!Array.isArray(strokes)) return;
      strokes.forEach(drawStroke);
    };

    const clear = () => {
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    socket.on("whiteboard:update", drawStroke);
    socket.on("whiteboard:state", handleState);
    socket.on("whiteboard:clear", clear);

    return () => {
      socket.off("whiteboard:update", drawStroke);
      socket.off("whiteboard:state", handleState);
      socket.off("whiteboard:clear", clear);
    };
  }, [socket, ctx]);

  // Mouse helpers
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDrawing = (e) => {
    setIsDrawing(true);
    prevPosRef.current = getPos(e);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e) => {
    if (!isDrawing || !ctx) return;

    const prev = prevPosRef.current;
    const pos = getPos(e);

    // local draw
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();

    // send to server
    socket.emit("whiteboard:draw", {
      partyId,
      stroke: {
        prevX: prev.x,
        prevY: prev.y,
        x: pos.x,
        y: pos.y,
        color,
        lineWidth,
      },
    });

    prevPosRef.current = pos;
  };

  const clearBoard = () => {
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    socket.emit("whiteboard:clear", { partyId });
  };

  return (
    <div
      className="
        flex-1 flex flex-col items-center w-full 
        px-4 pt-4 pb-4 bg-black/40
      "
    >
      {/* TOOLBAR */}
      <div
        className="
          w-full max-w-3xl flex items-center justify-between
          mb-3 px-2
        "
      >
        <div className="flex gap-3 items-center">
          {/* COLORS */}
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-8 rounded cursor-pointer"
          />

          {/* BRUSH SIZE */}
          <select
            value={lineWidth}
            onChange={(e) => setLineWidth(Number(e.target.value))}
            className="
              bg-white/10 border border-white/20 
              text-white text-xs rounded-lg px-2 py-1
            "
          >
            {[2, 3, 5, 8, 12, 18].map((s) => (
              <option key={s} value={s} className="bg-[#0a0f1f] text-white">
                {s}px
              </option>
            ))}
          </select>
        </div>

        {/* CLEAR BUTTON */}
        <button
          onClick={clearBoard}
          className="
            px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/40 
            text-red-200 hover:bg-red-500/30 transition backdrop-blur-xl text-sm
          "
        >
          Clear
        </button>
      </div>

      {/* CANVAS AREA */}
      <div
        className="
          w-full max-w-3xl aspect-video 
          rounded-xl border border-white/20 bg-white/5 backdrop-blur-xl
          overflow-hidden relative
        "
      >
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onMouseMove={draw}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}
