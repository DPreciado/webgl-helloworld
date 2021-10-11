class Time{
    constructor(){
      this.timeNow = Date.now();
      this.mDeltaTime = 0;
      this.updateTime();
    }
  
    updateTime(){
      this.mDeltaTime = (Date.now() - this.timeNow) / 1000;
      this.timeNow = Date.now();
        requestAnimationFrame(this.updateTime.bind(this));
    }
  
    deltaTime(){
      return this.mDeltaTime;
    }
  }
  
  export default Time;