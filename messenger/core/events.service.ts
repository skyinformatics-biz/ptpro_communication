import { Injectable, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';


@Injectable({
  providedIn: 'root'
})
export class Events {

    public Manager = new EventEmitter<any>();
    private MessengerEvents:Array<any> = [];

    constructor(){
        /** Total amount of messenger events */
        this.MessengerEvents[0] = {task: 'newContact', completion: false, data:[], 'remote':false}; 
        this.MessengerEvents[1] = {task: 'requestMessage', accepted: 2, data:[]}; 
        this.MessengerEvents[2] = {task: 'updateContact', data:[]}; 
    }

    public newContact(data, remote=false){
        this.MessengerEvents[0]['completion'] = true;
        this.MessengerEvents[0]['data'] = data;
        this.MessengerEvents[0]['remote'] = remote;

        this.Manager.emit(this.MessengerEvents[0]);
    }


    public requestDesicion(decision, index, chatId, data=[]){
        this.MessengerEvents[1]['decision'] = decision;
        this.MessengerEvents[1]['index'] = index;
        this.MessengerEvents[1]['chatId'] = chatId;
        this.MessengerEvents[1]['data'] = data;

        this.Manager.emit(this.MessengerEvents[1]);
    }

    
    public updateContact(index, value){

        this.MessengerEvents[2]['index'] = index; 
        this.MessengerEvents[2]['accepted'] = value; 

        this.Manager.emit(this.MessengerEvents[2]);
    }



    public subscribe(){
        this.Manager.subscribe(
            (data: any) => {
              return data;
            });
    }

    
}