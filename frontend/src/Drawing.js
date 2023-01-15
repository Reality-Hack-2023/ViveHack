import { useEffect, useRef, useState } from 'react';
import knife from './assets/weapon.svg';
import person from './assets/person.svg';
import bio from './assets/bio.svg';
import knifeWhite from './assets/weapon-white.svg';
import personWhite from './assets/person-white.svg';
import bioWhite from './assets/bio-white.svg';
import others from './assets/other.svg';
import map from './assets/map.jpg';

import axios from "axios";
import Draggable, {DraggableCore} from "react-draggable";

function Drawing() {
    const [drawing, setDrawing] = useState(false);
    const [minX, setMinX] = useState(0);
    const [minY, setMinY] = useState(0);
    const [maxX, setMaxX] = useState(960);
    const [maxY, setMaxY] = useState(640);
    const [canvasDone, setCanvasDone] = useState(false);
    
    // const [minX, setMinX] = useState(2000);
    // const [minY, setMinY] = useState(2000);
    // const [maxX, setMaxX] = useState(-1);
    // const [maxY, setMaxY] = useState(-1);
    // const [canvasDone, setCanvasDone] = useState(false);
    const [activeImg, setActiveImg] = useState("");
    const [activeButton, setActiveButton] = useState("");
    const [objs, setObjs] = useState([]);
    const canvasRef = useRef(null);
    const ctxRef = useRef(null);

    const addObj = (type, x, y) => {
        axios({
            method: "POST",
            url:"/data/add",
            params:{
                "type": type,
                "x": x,
                "y": y,
            }
        })
        .then((response) => {
            setObjs(response.data);
        });
    }
    const clearObj = () => {
        axios({
            method: "POST",
            url:"/data/clear",
        })
        .then((response) => {
            setObjs(response.data);
        });
    }
    const getObjs = () => {
        axios({
            method: "GET",
            url:"/data",
        })
        .then((response) => {
            setObjs(response.data);
            console.log(response.data);
        });
    }
    const updateObj = (id, x, y) => {
        const form = new FormData();
        form.append('items', '[{"id": "' + id + '", "x":' + x + ', "y":' + y + '}]'); 

        axios({
            method: "POST",
            url:"/data/update",
            data: {
                "id": id,
                "x": x,
                "y": y
            }
        })
        .then((response) => {
            setObjs(response.data);
        });
    }
    const xToRatio = (x) => {
        console.log(x, minX, maxX);
        return (x - minX) / (maxX - minX)
    }
    const yToRatio = (y) => {
        console.log(y, minY, maxY);
        return (y - minY) / (maxY - minY)
    }
    const ratioToX = (x) => {
        return x * (maxX - minX) + minX
    }
    const ratioToY = (y) => {
        console.log(y, minY, maxY, y * (maxY - minY) + minY)
        return y * (maxY - minY) + minY
    }
    const drawLine = (x1, y1, x2, y2, color) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctxRef.current = ctx;
    }
    const confirmCanvas = () => {
        setCanvasDone(true);
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        console.log(rect);
        console.log(rect["x"], rect["y"]);
        clear();
        drawLine(minX, minY, minX, maxY, "black");
        drawLine(minX, maxY, maxX, maxY, "black");
        drawLine(maxX, maxY, maxX, minY, "black");
        drawLine(maxX, minY, minX, minY, "black");
        console.log("done", maxX - minX, minX, maxY - minY, minY);
        setMinX(minX + rect["x"]);
        setMaxX(maxX + rect["x"]);
        setMinY(minY + rect["y"]);
        setMaxY(maxY + rect["y"]);
        console.log("done", maxX - minX, minX, maxY - minY, minY);
    }
    const updateCanvas = (x, y) => {
        if (x < minX) setMinX(x);
        if (y < minY) setMinY(y);
        if (x > maxX) setMaxX(x);
        if (y > maxY) setMaxY(y);
    }
    const startDraw = ({ nativeEvent }) => {
        if (canvasDone) return;
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.beginPath();
        ctxRef.current.moveTo(offsetX, offsetY);
        setDrawing(true);
        if (!canvasDone) updateCanvas(offsetX, offsetY);
    };
    const stopDraw = () => {
        if (canvasDone) return;
        ctxRef.current.closePath();
        setDrawing(false);
    };
    const draw = ({ nativeEvent }) => {
        if (canvasDone) return;
        if (!drawing) return;
        const { offsetX, offsetY } = nativeEvent;
        ctxRef.current.lineTo(offsetX, offsetY);
        ctxRef.current.stroke();
        if (!canvasDone) updateCanvas(offsetX, offsetY);
    };
    const clear = () => {
        ctxRef.current.clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
        );
    };
    const onMouseDownImage = (event) => {
        console.log(minX, minY);
        setActiveImg(event.target.id);
    }
    const onMouseMoveImage = (event) => {
        updateObj(activeImg, xToRatio(event.clientX), yToRatio(event.clientY));
    }
    const onMouseUpImage = (event) => {
        updateObj(activeImg, xToRatio(event.clientX), yToRatio(event.clientY));
        setActiveImg("");
    }
    const setActive = (event) => {
        setActiveButton(event.target.id);
        console.log(activeButton);
    }
    const addItem = () => {
        if (activeButton == "") return;
        addObj(activeButton, 0.5, 0.5);
        setActiveButton("");
    }
    const translateUrl = (typeStr) => {
        let map = {
            "person": personWhite,
            "knife": knifeWhite,
            "bio": bioWhite,
        };
        return map[typeStr];
    }
    const clearItem = () => {
        clearObj();
    }
    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctxRef.current = ctx;
    }, []);
    useEffect(() => {
        const interval = setInterval(() => {
            getObjs();
        }, 2000);
        return () => clearInterval(interval);
      }, []);
    return (
        <>
            <div style={{position:"relative", width:"960", height:"640"}}>
            <h1>Crime Reality</h1>
                <canvas
                    onMouseDown={startDraw}
                    onMouseUp={stopDraw}
                    onMouseMove={draw}
                    ref={canvasRef}
                    width={960} 
                    height={640}
                    style={{backgroundImage:'url(' + map + ')', opacity:0.8, backgroundSize: 960}}
                />
                {canvasDone && objs && objs.map((obj, index) => (
                        <DraggableCore
                            key={obj.id} 
                            onStart={onMouseDownImage}
                            onDrag={onMouseMoveImage}
                            onStop={onMouseUpImage}
                            >
                            <img id={obj.id} src={translateUrl(obj.type)} width={50} draggable={false}
                                style={{left:ratioToX(obj.x) - 25, top:ratioToY(obj.y) - 25, position:"absolute"}}
                            />
                        </DraggableCore>
                ))}
            </div>
            {!canvasDone && <button onClick={confirmCanvas}>Confirm Canvas</button>}
            {canvasDone && <button style={{display:"inline-block"}} onClick={setActive} id="knife"> <img id="knife" src={knife} width={30}/></button>}
            {canvasDone && <button style={{display:"inline-block"}} onClick={setActive} id="bio"> <img id="bio" src={bio} width={30}/></button>}
            {canvasDone && <button style={{display:"inline-block"}} onClick={setActive} id="person"> <img id="person" src={person} width={30}/></button>}
            {canvasDone && <button style={{display:"inline-block"}} id="others"> <img id="person" src={others} width={30}/></button>}
            <br/>
            {canvasDone && <button onClick={addItem}>Add</button>}
            {canvasDone && <button onClick={clearItem}>Clear</button>}
        </>
    );
}

export default Drawing;