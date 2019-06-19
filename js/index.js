class Canvas {
    constructor(Obj) {//boxDom,ctx,width,height,imgs,tsimg
        this.boxDom = Obj.boxDom
        this.penbtn = Obj.penbtn
        this.deleteline = Obj.deleteline
        this.addpicbtn = Obj.addpicbtn
        this.savePic = Obj.savePic
        this.move = Obj.move
        this.colorbtn = Obj.colorbtn
        this.outbox = Obj.outbox
        this.lines = Obj.lines
        this.picUrl = ""
        this.ctx = null
        this.stroke = Obj.strokeStyle//线的颜色
        this.width = Obj.width
        this.height = Obj.height
        this.background = Obj.background
        this.flag = 2
        this.start = []
        this.end = []
        this.allLine = []
        this.allText = []
        this.popUp = null
        this.picLayer = null
        this.picCtx = null
        this.hideLine = []

        this.testBrowser()
        this.creatUi()
    }
    testBrowser() {
        if (this.boxDom.getContext("2d")) {
            console.log("该浏览器支持canvas")
        } else {
            alert("请升级浏览器")
        }
    }
    creatUi() {
        this.ctx = this.boxDom.getContext("2d")
        this.boxDom.width = this.width
        this.boxDom.height = this.height
        this.boxDom.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"
        this.boxDom.style.zIndex = "10"
        this.setStrokeStyle()
        this.boxDom.style.background = this.background
        this.creatPicLayer()
        this.creatPopup()
        this.penbtn.onclick = () => {
            this.flag = 0
            this.mark()
        }

        this.deleteline.onclick = () => {
            this.flag = 1
            this.delete()
        }

        this.move.onclick = () => {
            this.flag = 2
            this.moves()
        }
        this.addpicbtn.onchange = () => {
            this.allLine=[]
            this.lines.innerHTML = ""
            this.clearbord()
            var reads = new FileReader();
            let f = this.addpicbtn.files[0]
            reads.readAsDataURL(f);
            reads.onload = (e) => {
                this.picUrl = e.target.result
                this.DrawPic()
            };
        }
        this.savePic.onclick = () => {
            // debugger
            let imgData = this.picCtx.getImageData(0, 0, this.width, this.height)
            let mypic = document.createElement("canvas")
            let mypicCtx = mypic.getContext('2d')
            mypic.width = this.width
            mypic.height = this.height
            mypicCtx.putImageData(imgData, 0, 0)

            let markUrl = this.boxDom.toDataURL()
            // debugger
            let img = new Image();
            
            img.onload = () => {
                mypicCtx.drawImage(img, 0, 0);

                let strDataURI = mypic.toDataURL();
                let a = document.createElement("a");
                // a.href = strDataURI;
                // a.download = "name";
                // a.click();
                a.setAttribute("href", strDataURI);
                a.setAttribute("download","name.png");
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }
            img.src = markUrl


            // var image = mycanvas.toDataURL("image/jpeg");
            // var $a = document.createElement('a');
            // $a.setAttribute("href", image);
            // $a.setAttribute("download", this.state.nowDate + "多能点号图.jpg");//需要加上后缀名
            // document.body.appendChild($a);
            // $a.click();
            // document.body.removeChild($a);
        }
    }
    /**
     * 设置画线颜色
     */
    setStrokeStyle() {
        this.ctx.strokeStyle = this.stroke
    }
    /**
     * 点击标记按钮
     */
    mark() {
        /**
         * 点击确定起点，移动确定终点，调用画一根线的函数，鼠标抬起清空移动
         * 鼠标移动过程中清空画板在调用绘制所有线的函数
         * 鼠标抬起清空画板，调用绘制所有线的函数
         * **/
        this.boxDom.onmousedown = (e) => {
            if (this.flag == 0 && this.popUp.style.display == "none") {
                let points = this.getCanvasPos(this.boxDom, e)
                // let startpoint=[e.pageX-this.boxDom.offsetLeft,e.pageY-this.boxDom.offsetTop]
                let startpoint = [points.x, points.y]
                this.start = startpoint
                this.boxDom.onmousemove = (e) => {
                    let pointa = this.getCanvasPos(this.boxDom, e)
                    // let point1=e.pageX-this.boxDom.offsetLeft
                    // let point2=e.pageY-this.boxDom.offsetTop
                    let point = [pointa.x, pointa.y]
                    this.end = point
                    this.clearbord()
                    this.drawall()
                    this.Drawline({ start: this.start, end: this.end })
                }
            }
        }
        this.boxDom.onmouseup = (e) => {
            if (this.flag == 0 && this.popUp.style.display == "none") {
                this.boxDom.onmousemove = null
                let points = this.getCanvasPos(this.boxDom, e)
                this.end = [points.x, points.y]
                if (this.start[0] != this.end[0] && this.start[1] != this.end[1]) {//判断数组是否相等，不相等的话添加，防止点击事件添加线条
                    this.allLine.push({ start: this.start, end: this.end, color: this.stroke })
                    this.popUp.style.display = "block"
                    this.popUp.style.top = this.end[1] + 120 + "px"
                    this.popUp.style.left = this.end[0] + 320 + "px"
                }
                this.clearbord()
                this.drawall()

            }
        }
    }
    getCanvasPos(canvas, e) {//获取鼠标在canvas上的坐标
        var rect = canvas.getBoundingClientRect();
        var leftB = parseInt(this.getStyles(canvas).borderLeftWidth);//获取的是样式，需要转换为数值
        var topB = parseInt(this.getStyles(canvas).borderTopWidth);
        return {
            x: (e.clientX - rect.left) - leftB,
            y: (e.clientY - rect.top) - topB
        };
    }
    getStyles(obj) {//兼容FF，IE10; IE9及以下未测试
        return document.defaultView.getComputedStyle(obj);
    }
    /**
     * 点击删除按钮
     */
    delete() {
        this.boxDom.onclick = (e) => {
            if (this.flag == 1) {
                for (let i in this.allLine) {
                    let poi = this.getCanvasPos(this.boxDom, e)
                    if (this.containStroke(this.allLine[i].start[0], this.allLine[i].start[1], this.allLine[i].end[0], this.allLine[i].end[1], 10, poi.x, poi.y)) {
                        this.allLine.splice(i, 1)
                    }
                    this.ctx.clearRect(0, 0, this.width, this.height);
                    this.drawall()
                }
            }
            this.setLine()
        }
    }
    /**
     * 点击移动按钮
     */
    moves() {
        this.boxDom.onmousemove = (e) => {
            if (this.flag == 2) {
                for (let i in this.allLine) {
                    let poi = this.getCanvasPos(this.boxDom, e)
                    if (this.containStroke(this.allLine[i].start[0], this.allLine[i].start[1], this.allLine[i].end[0], this.allLine[i].end[1], 8, poi.x, poi.y)) {
                        this.allLine[i].color = "#0099FF"
                        this.allLine[i].circle = true
                        this.clearbord()
                        this.drawall()

                        if (this.judgeCirle(this.allLine[i], e) == 'start') {
                            this.boxDom.onmousedown = () => {
                                this.boxDom.onmousemove = (e) => {
                                    let point = this.getCanvasPos(this.boxDom, e)
                                    this.allLine[i].start = [point.x, point.y]
                                    this.clearbord()
                                    this.drawall()
                                }
                            }
                            this.boxDom.onmouseup = () => {
                                this.boxDom.onmousedown = null
                                this.boxDom.onmousemove = null
                                this.moves()
                            }
                        } else if (this.judgeCirle(this.allLine[i], e) == 'end') {
                            this.boxDom.onmousedown = () => {
                                this.boxDom.onmousemove = (e) => {
                                    let point = this.getCanvasPos(this.boxDom, e)
                                    this.allLine[i].end = [point.x, point.y]
                                    this.clearbord()
                                    this.drawall()
                                }
                            }
                            this.boxDom.onmouseup = () => {
                                this.boxDom.onmousedown = null
                                this.boxDom.onmousemove = null
                                this.moves()
                            }
                        } else if (this.judgeCirle(this.allLine[i], e) == false) {
                            this.moves()
                        }
                    }
                    else if (!this.containStroke(this.allLine[i].start[0], this.allLine[i].start[1], this.allLine[i].end[0], this.allLine[i].end[1], 10, e.pageX - this.boxDom.offsetLeft, e.pageY - this.boxDom.offsetTop)) {
                        this.allLine[i].color = this.stroke
                        this.allLine[i].circle = false
                        this.clearbord()
                        this.drawall()
                    }
                }
            }
        }
        this.boxDom.onmousedown = (e1) => {
            if (this.flag == 2) {
                for (let i in this.allLine) {
                    let poi = this.getCanvasPos(this.boxDom, e1)
                    if (this.containStroke(this.allLine[i].start[0], this.allLine[i].start[1], this.allLine[i].end[0], this.allLine[i].end[1], 10, poi.x, poi.y)) {
                        let arr1 = this.allLine[i].start
                        let arr2 = this.allLine[i].end
                        let point1 = this.getCanvasPos(this.boxDom, e1)
                        let a1 = point1.x
                        let b1 = point1.y
                        this.boxDom.onmousemove = (e2) => {
                            this.allLine[i].color = "#0099FF"
                            let point2 = this.getCanvasPos(this.boxDom, e2)
                            let a2 = point2.x
                            let b2 = point2.y

                            let gapx = a2 - a1
                            let gapy = b2 - b1

                            let aaax = gapx + arr1[0]
                            let aaay = gapy + arr1[1]
                            let bbbx = gapx + arr2[0]
                            let bbby = gapy + arr2[1]
                            this.allLine[i].start = [aaax, aaay]
                            this.allLine[i].end = [bbbx, bbby]
                            this.clearbord()
                            this.drawall()
                        }
                    } else {

                    }
                }
            }
        }
        this.boxDom.onmouseup = (e) => {
            this.boxDom.onmousemove = null
            this.moves()
        }
    }
    /**
     * 产生背景图层 
     */
    creatPicLayer() {
        this.picLayer = document.createElement("canvas")
        this.picCtx = this.picLayer.getContext("2d")
        this.picLayer.width = this.width
        this.picLayer.height = this.height
        this.picLayer.style.cssText = "position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"
        this.outbox.appendChild(this.picLayer)
    }
    Drawline(a) {//画线
        if (a.color) {
            this.ctx.strokeStyle = a.color;
        }
        this.ctx.lineWidth = 2
        this.ctx.beginPath();
        this.ctx.moveTo(a.start[0], a.start[1])
        this.ctx.lineTo(a.end[0], a.end[1])
        this.ctx.stroke()
    }
    DrawBox(a) {//画方形
        this.ctx.beginPath()
        this.ctx.fillStyle = "rgba(255,255,255,0.5)"
        this.ctx.fillRect(a.end[0] + 2.5, a.end[1] + 5, this.ctx.measureText(a.text.value).width + 5, 20);
    }
    DrawText(a) {
        this.ctx.fillStyle = "yellow"
        this.ctx.font = "30px";
        this.ctx.fillText(a.text.value, a.end[0] + 5, a.end[1] + 18);
    }
    DrawRound(a) {//线条两端画圆
        this.ctx.beginPath();
        this.ctx.strokeStyle = '#33FFFF';
        this.ctx.arc(a.start[0], a.start[1], 6, 0, 2 * Math.PI);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.strokeStyle = '#33FFFF';
        this.ctx.arc(a.end[0], a.end[1], 6, 0, 2 * Math.PI);
        this.ctx.stroke();
    }
    DrawPic(a) {
        let img = new Image();
        img.src = this.picUrl
        img.onload = () => {
            this.picCtx.drawImage(img, 50, 50, this.height - 100, this.height - 100)
            // this.picCtx.drawImage(img, 50, 50)
        }
    }
    drawall() {//画所有
        for (let i in this.allLine) {
            this.Drawline(this.allLine[i])
            if (this.allLine[i].fangkuang) {
                this.DrawBox(this.allLine[i])
            }
            if (this.allLine[i].text) {
                this.DrawText(this.allLine[i])
            }
            if (this.allLine[i].circle) {
                this.DrawRound(this.allLine[i])
            }
        }
    }
    clearbord() {
        this.ctx.clearRect(0, 0, this.width, this.height);
    }
    setLine() {
        this.lines.innerHTML = ""
        for (let i in this.allLine) {
            let dom = document.createElement("div")
            let p = document.createElement("p")
            let span = document.createElement("span")
            dom.style.cssText = "width:100%;height:50px;background:#99CCCC;padding:10px 20px;border:1px solid #ddd;"
            p.style.cssText = "float:left;line-height:50px;width:180px;text-overflow:ellipsis;overflow:hidden;white-space:nowrap"
            // console.log(this.allLine)
            p.title = this.allLine[i].text.value
            span.style.cssText = "cursor:pointer;text-align:center;float:left;display:block;width:50px;height:25px;background:#FFCCCC;border-radius:3px;margin-top:12.5px;line-height:25px;"
            p.innerHTML = this.allLine[i].text.value
            span.innerHTML = "显示"
            span.setAttribute('time', this.allLine[i].time)
            dom.appendChild(p)
            dom.appendChild(span)
            this.lines.appendChild(dom)
            span.onclick = (e) => {
                if (e.target.innerHTML == "显示") {
                    e.target.innerHTML = "隐藏"
                    for (let j in this.allLine) {
                        if (this.allLine[j].time == e.target.getAttribute('time')) {
                            this.hideLine.push(this.allLine[j])
                            this.allLine.splice(j, 1)
                        }
                    }
                    this.clearbord()
                    this.drawall()
                } else if (e.target.innerHTML == "隐藏") {
                    e.target.innerHTML = "显示"
                    for (let k in this.hideLine) {
                        if (this.hideLine[k].time == e.target.getAttribute('time')) {
                            this.allLine.push(this.hideLine[k])
                            this.hideLine.splice(k, 1)
                        }
                    }
                    this.sortTime(this.allLine)
                    this.clearbord()
                    this.drawall()
                }
            }
        }
    }

    sortTime(arr) {
        arr = arr.sort(this.sortNumber)
    }
    sortNumber(a, b) {
        return a - b
    }
    /**
     * 判断点是否在直线上
     */
    containStroke(x0, y0, x1, y1, lineWidth, x, y) {
        if (lineWidth === 0) {
            return false;
        }
        var _l = lineWidth;
        var _a = 0;
        var _b = x0;
        // Quick reject
        if (
            (y > y0 + _l && y > y1 + _l)
            || (y < y0 - _l && y < y1 - _l)
            || (x > x0 + _l && x > x1 + _l)
            || (x < x0 - _l && x < x1 - _l)
        ) {
            return false;
        }

        if (x0 !== x1) {
            _a = (y0 - y1) / (x0 - x1);
            _b = (x0 * y1 - x1 * y0) / (x0 - x1);
        }
        else {
            return Math.abs(x - x0) <= _l / 2;
        }
        var tmp = _a * x - y + _b;
        var _s = tmp * tmp / (_a * _a + 1);
        return _s <= _l / 2 * _l / 2;
    }
    /**
     * 判断鼠标是否在圆上
     */
    judgeCirle(a, e) {
        let poi = this.getCanvasPos(this.boxDom, e)
        let clickX = poi.x
        let clickY = poi.y
        let distanceFromCenterstart = Math.sqrt(Math.pow(a.start[0] - clickX, 2) + Math.pow(a.start[1] - clickY, 2))
        let distanceFromCenterend = Math.sqrt(Math.pow(a.end[0] - clickX, 2) + Math.pow(a.end[1] - clickY, 2))
        if (distanceFromCenterstart <= 6) {
            return 'start'
        } else if (distanceFromCenterend <= 6) {
            return 'end'
        } else if (distanceFromCenterstart > 6 && distanceFromCenterend > 6) {
            return false
        }
    }
    getTime() {
        return new Date().getTime()
    }


    /**
     * 动态生成弹出窗
     */
    creatPopup() {
        this.popUp = document.createElement("div");
        this.popUp.style.cssText = "width:184px;height:74px;background:greenyellow;padding:8px;display:none;position:absolute;top:0;left:0;border-radius:5px;z-index:100"

        let label = document.createElement("label");
        label.innerHTML = "标注信息"
        this.popUp.appendChild(label)
        let input1 = document.createElement('input')
        input1.type = "text"
        input1.id = "textvalue"
        input1.style.cssText = "width:100%;outline:none;border:1px solid #ddd;height:28px;margin-bottom:5px"
        this.popUp.appendChild(input1)

        let div2 = document.createElement("div");
        div2.style.cssText = "display:flex;justify-content: space-around"
        this.popUp.appendChild(div2)

        let btn1 = document.createElement('input')
        btn1.type = "button"
        btn1.value = "确定"
        btn1.id = "btn1"
        btn1.style.cssText = "width:40px;outline:none;height:24px"
        div2.appendChild(btn1)
        btn1.addEventListener('click', () => {
            this.popUp.style.display = "none"

            this.allLine[this.allLine.length - 1].fangkuang = { weizhi: this.end }

            this.allLine[this.allLine.length - 1].text = { weizhi: this.end, value: input1.value }
            this.allLine[this.allLine.length - 1].time = this.getTime()
            input1.value = ""
            this.clearbord()
            this.drawall()
            this.setLine()
        })


        let btn2 = document.createElement('input')
        btn2.type = "button"
        btn2.id = "btn2"
        btn2.value = "取消"
        btn2.style.cssText = "width:40px;outline:none;height:24px"
        div2.appendChild(btn2)
        btn2.addEventListener('click', () => {
            this.popUp.style.display = "none"
            input1.value = ""
            this.clearbord()
            this.allLine.splice(this.allText.length - 1, 1)
            this.drawall()
        })
        document.body.appendChild(this.popUp);
    }
}