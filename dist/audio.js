// Locally synthesized ambience: no downloads, tracking, autoplay, or audio files.
export class Atmosphere {
 constructor(){this.context=null;this.active=false;this.volume=.35;this.nodes=[];this.scene='atrium';}
 async toggle(scene){if(this.active){this.active=false;await this.context?.suspend();return false;}const Audio=globalThis.AudioContext||globalThis.webkitAudioContext;if(!Audio)throw new Error('Audio is unavailable in this browser.');this.context??=new Audio();await this.context.resume();this.active=true;this.setScene(scene);return true;}
 setScene(scene){this.scene=scene;if(!this.context||!this.active)return;this.nodes.forEach(n=>{try{n.stop();}catch{}n.disconnect();});this.nodes=[];if(this.master)this.master.disconnect();const c=this.context;this.master=c.createGain();this.master.gain.setValueAtTime(0,c.currentTime);this.master.gain.linearRampToValueAtTime(this.volume*.22,c.currentTime+1.5);this.master.connect(c.destination);
 const buffer=c.createBuffer(1,c.sampleRate*6,c.sampleRate),data=buffer.getChannelData(0);let smooth=0;for(let i=0;i<data.length;i++){smooth=(smooth+(Math.random()*2-1)*.03)/1.03;data[i]=scene==='rooftop'?(Math.random()*2-1)*.55:smooth*3;}
 const noise=c.createBufferSource();noise.buffer=buffer;noise.loop=true;const filter=c.createBiquadFilter();filter.type='lowpass';filter.frequency.value=scene==='rooftop'?1150:scene==='server'?480:230;noise.connect(filter);filter.connect(this.master);noise.start();this.nodes.push(noise,filter);
 [scene==='server'?60:50,scene==='rooftop'?73.42:100].forEach((freq,i)=>{const tone=c.createOscillator(),gain=c.createGain();tone.type='sine';tone.frequency.value=freq;gain.gain.value=i?.035:.08;tone.connect(gain);gain.connect(this.master);tone.start();this.nodes.push(tone,gain);});
 }
 setVolume(value){this.volume=Math.min(1,Math.max(0,Number(value)));if(this.master)this.master.gain.setTargetAtTime(this.volume*.22,this.context.currentTime,.2);}
 async pauseHidden(hidden){if(!this.context||!this.active)return;if(hidden)await this.context.suspend();else await this.context.resume();}
}
