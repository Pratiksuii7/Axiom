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
class PhysicsBall{
    constructor(x,y,radius,color){
        this.id =nextEntityId++;
        this.pos =new Vec2(x,y);
        this.vel =new Vec2(0,0);
        this.acc= new Vec2(0,0);
        this.r = radius;
        this.mass = this.mass;
        this.invMass = mass === 0?0:1/mass;
        this.color = coor||THE_COLORS[Math.floor(Math.random()(THE_COLORS.length))];
        this.isGrabbed =false;
        this.trail =[];
    }
    applyForce(forceVec){
        let accelerationDueToForce =forceVec.mult(this.invMass);
        this.acc.addMut(accelerationDueToForce);
    }
    update(){
        if(this.isGrabbed){
            this.vel.x = 0;
            this.vel.y =0;
            return;
        }
        this.acc.x +=config.wind;
        this.acc.y +=config.gravity;
        this.vel.addMut(this.acc);
        this.vel.multMut(config.drag);
        this.pos.addMut(this.vel);
        this.acc.x= 0;
        this.acc.y = 0;
        if(config.doTrails){
            this.trail.push(this.pos.copy());
            if(this.trail.length>40){
                this.trail.shift();
            }
        }else if(this.trail.length>0){
            this.trail =[];
        }
    }
    draw(ctx){
        if(config.doTrails&&this.trail.length>1){
            ctx.beginPath();
            ctx.moveTo(this.trail[0].x,this.trail[0].y);
            for(let i=1;i<this.trail.length;i++){
                ctx.lineTo(this.trail[i].x,this.trail[i].y);
            }
            ctx.strokeStyle= this.color;
            ctx.lineWidth = this.r*0.4;
            ctx.lineCap ='round';
            ctx.lineJoin ='round';
            ctx.globalAlpha = 0.3;
            ctx.stroke();
            ctx.globalAlpha = 1.0;
        }
        //super tired
        ctx.beginPath();
        ctx.arc(this.pos.x,this.pos.y,this.r,0,Math.PI*2);
        if(config.doFill){
            let grad = ctx.createRadialGradient(this.pos.x-this.r*0.3,this.pos.y-this.r*0.3,this.r*0.1,this.pos.x,this.pos.y,this.r);
            grad.addColorStop(0,'#ffffff');
            grad.addColorStop(1,this.color);
            ctx.fillStyle =grad;
            ctx.fill();
            ctx.lineWidth =1;
            ctx.strokeStyle ='rgba(0,0,0,0.5)';
            ctx.stroke();
        }else{
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.stroke();
        }
        if(this.isGrabbed){
            ctx.beginPath();
            ctx.arc(this.pos.x,this.pos.y,this.r+4,0,Math.PI*2);
            ctx.strokeStyle = 'white';
            ctx.lineWidth = 3;
            ctx.setLineDash([5,5]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
        if(config.doVectors){
            ctx.beginPath();
            ctx.arc(this.pos.x,this.pos.y,this.r+4,0,Math.PI*2);
            ctx.strokeStyle ='white';
            ctx.lineWidth= 2;
            ctx.stroke();
            ctx.beginPath();
            ctx.arc(this.pos.x,this.pos.y,2,0,Math.PI*2);
            ctx.fillStyle = '#fff';
            ctx.fill();
        }
    }
}
