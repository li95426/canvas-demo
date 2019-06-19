window.onload=function(){
    let addpicbtn=document.getElementById("addpicbtn")
    let cvs=document.getElementById("cvs")
    let penbtn=document.getElementById("penbtn")
    let deleteline=document.getElementById("deleteLine")
    let move=document.getElementById("move")
    let colorbtn=document.getElementById("colorbtn")
    let outbox=document.getElementById("outbox")
    let savePic=document.getElementById("savePic")
    let allLine=document.getElementById("allLine")
    let canvas1=new Canvas({
        addpicbtn:addpicbtn,
        outbox:outbox,
        boxDom:cvs,
        penbtn:penbtn,
        deleteline:deleteline,
        colorbtn:colorbtn,
        strokeStyle:"#6666FF",
        width:"1000",
        height:"800",
        move:move,
        savePic:savePic,
        lines:lines
    })
}