//less go lets do this
const THE_COLORS =[
 '#ff4757','#2ed573','#1e90ff','#ffa502',
 '#ff6b81','#7bed9f','#70a1ff','#eccc68',
 '#a29bfe','#fd79a8','#00b894','#0984e3'   
];
function syncCanvasSize(){
    canvas.width =wrapper.clientWidth;
    canvas.height = wrapper.clientHeight;
}
window.addEventListener('resize',syncCanvasSize);
syncCanvasSize();

class Vec2{
   constructor(x=0,y=0){
    this.x = x;
    this.y = y;
   }
   add(v){
    return new Vec2(this.x+v.x,this.y+v.y);
   }
   sub(v){
    return new Vec2(this.x-v.x,this.y-v.y);
   }
   mult(n){
    return new Vec2(this.x*n,this.y*n);
   }
   div(n){
    if(n===0){
        console.warn("Vector 2 div by zero");
        return new Vec2();
    }
    return new Vec2(this.x/n,this.y/n);
   }
   addMut(v){
    this.x +=v.x;
    this.y +=v.y;
    return this;
   }
   subMut(v){
    this.x-=v.x;
    this.y-=v.y;
    return this;
   }
   multMut(n){
    this.x*=n;
    this.y *=n;
    return this;
   }
    magSq(){
        return this.x*this.x +this.y*this.y;
    }
    mag(){
        return Math.aqrt(this.magSq());
    }
    normalize(){
        let m= this.mag();
        if(m===0){
            this.x =0;
            this.y = 0;
        }else{
            this.x/=m;
            this.y/=m;
        }
        return this;
    }
    dot(v){
        return this.x*v.x+this.y*v.y;
    }
    copy(){
        return new Vec2(this.x,this.y);
    }
}