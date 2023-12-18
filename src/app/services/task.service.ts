import { Injectable } from '@angular/core';

type TaskObj = {
    id: string,
    status: string
}
type Func = (id: string)=>void
type PromisFunc = (id: string)=>Promise<void>
@Injectable({
  providedIn: 'root'
})
export class TaskService {
  
  constructor() { }
  private tasks = {}
  
  createTask(id: string, callback: PromisFunc|Func){
    this.tasks[id] = {
      status: 1
    }
    try {
      callback(id)
    } catch(error){
      console.log(error);
      
    }
    
  }

  checkStatus(id: string){
    if(this.tasks[id].status == 0){
      throw new Error('stopped')
    }
  }

  abortTask(id: string){
    this.tasks[id].status = 0
  }
}
