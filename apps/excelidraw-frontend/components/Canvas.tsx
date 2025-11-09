// Canvas.tsx
import { useEffect, useRef, useState } from "react";
import { IconButton } from "./IconButton";
import {
  Circle,
  Pencil,
  RectangleHorizontalIcon,
  MousePointer2,
  Type,
  Minus,
  MoveUpRight,
  Diamond,
  Eraser,
  ZoomIn,
  ZoomOut,
  Move,

} from "lucide-react";
import { Game } from "@/draw/Game";
import { Tools } from "@/draw/tools";

type Tool = Tools;

export function Canvas({roomId, socket,}: {socket: WebSocket;roomId: string;}) 
{
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game | undefined>(undefined);
  const [selectedTool, setSelectedTool] = useState<Tool>("pencil");
  const [color, setColor] = useState<string>("#ffffff");
  const [stroke, setStroke] = useState<number>(2);

  // sync game tool and style whenever anything changes
  useEffect(() => {
    if (game) {
      game.setTool(selectedTool);
      game.setStrokeColor(color);
      game.setStrokeWidth(stroke);
    }
  }, [game, selectedTool, color, stroke]);

  // initialize Game once
  useEffect(() => {
    if (!canvasRef.current) return;
    const g = new Game(canvasRef.current, roomId, socket);
    setGame(g);

    // set initial camera / zoom if desired
    g.setZoom(1);
    g.setCamera(0, 0);

    return () => {
      g.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canvasRef, roomId, socket]);

  // wheel-to-zoom on canvas (cursor-focused)
  useEffect(() => {
    const el = canvasRef.current;
    if (!el || !game) return;

    const onWheel = (ev: WheelEvent) => {
      ev.preventDefault();
      const rect = el.getBoundingClientRect();
      const cx = ev.clientX - rect.left;
      const cy = ev.clientY - rect.top;
      const delta = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      game.setZoom(game.getZoom() * delta, cx, cy);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
    };
  }, [canvasRef, game]);

  return (
    <div style={{ height: "100vh", overflow: "hidden" }}>
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{
          display: "block",
          cursor: selectedTool === "eraser" ? "crosshair" : "default",
        }}
      />
      <Topbar
        selectedTool={selectedTool}
        setSelectedTool={setSelectedTool}
        game={game}
        color={color}
        setColor={setColor}
        stroke={stroke}
        setStroke={setStroke}
      />
    </div>
  );
}

function Topbar({
  selectedTool,
  setSelectedTool,
  game,
  color,
  setColor,
  stroke,
  setStroke,
}: {
  selectedTool: Tool;
  setSelectedTool: (s: Tool) => void;
  game?: Game | undefined;
  color: string;
  setColor: (c: string) => void;
  stroke: number;
  setStroke: (n: number) => void;
}) {
  return (
    <div style={{ position: "fixed", top: 10, left: 10, zIndex: 999 , maxWidth: "96vw", maxHeight: "96vh"}}>
      <div
        className="flex flex-wrap  bg-black/50 p-1 rounded-md items-center"
        style={{ display: "flex", alignItems: "center" ,maxWidth: "90vw"}}
      >
        <IconButton
          onClick={() => setSelectedTool("pencil")}
          activated={selectedTool === "pencil"}
          icon={<Pencil />}
        />
        <IconButton
          onClick={() => setSelectedTool("rect")}
          activated={selectedTool === "rect"}
          icon={<RectangleHorizontalIcon />}
        />
        <IconButton
          onClick={() => setSelectedTool("circle")}
          activated={selectedTool === "circle"}
          icon={<Circle />}
        />
        <IconButton
          onClick={() => setSelectedTool("line")}
          activated={selectedTool === "line"}
          icon={<Minus />}
        />
        <IconButton
          onClick={() => setSelectedTool("arrow")}
          activated={selectedTool === "arrow"}
          icon={<MoveUpRight />}
        />
        <IconButton
          onClick={() => setSelectedTool("diamond")}
          activated={selectedTool === "diamond"}
          icon={<Diamond />}
        />
        <IconButton
          onClick={() => setSelectedTool("text")}
          activated={selectedTool === "text"}
          icon={<Type />}
        />
        <IconButton
          onClick={() => setSelectedTool("select")}
          activated={selectedTool === "select"}
          icon={<MousePointer2 />}
        />
        <IconButton
          onClick={() => setSelectedTool("eraser")}
          activated={selectedTool === "eraser"}
          icon={<Eraser />}
        />

        {/* color & stroke controls */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginLeft: 8,
          }}
        >
          <input
            aria-label="Stroke color"
            title="Stroke color"
            type="color"
            value={color}
            onChange={(e) => {
              setColor(e.target.value);
              game?.setStrokeColor(e.target.value);
            }}
          />
          <input
            aria-label="Stroke width"
            title="Stroke width"
            type="range"
            min={1}
            max={30}
            value={stroke}
            onChange={(e) => {
              const v = Number(e.target.value);
              setStroke(v);
              game?.setStrokeWidth(v);
            }}
          />
        </div>

        {/* zoom/pan quick buttons */}
        <div style={{ display: "flex", gap: 6, marginLeft: 8 }}>
          <IconButton
            onClick={() => game?.setZoom((game?.getZoom() || 1) * 1.12)}
            activated={false}
            icon={<ZoomIn />}
          />
          <IconButton
            onClick={() => game?.setZoom((game?.getZoom() || 1) / 1.12)}
            activated={false}
            icon={<ZoomOut />}
          />
          <IconButton
            onClick={() => game?.resetCamera()}
            activated={false}
            icon={<Move />}
          />
        </div>

        
      </div>
    </div>
  );
}
