import { Injectable, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';


@Injectable({
  providedIn: 'root'
})
export class Events {

    public Manager = new EventEmitter<any>();
    private MessengerEvents:Array<any> = [];

    constructor(){
        this.MessengerEvents[0] = {task: 'newcontact', completion: false, data:[], 'remote':false}; 
        this.MessengerEvents[1] = {task: 'requestmessage', accepted: 2, data:[]}; 
        this.MessengerEvents[2] = {task: 'updatecontact', data:[]}; 
    }

    public emitNewContact(data, remote=false){
        this.MessengerEvents[0]['completion'] = true;
        this.MessengerEvents[0]['data'] = data;
        this.MessengerEvents[0]['remote'] = remote;

        this.Manager.emit(this.MessengerEvents[0]);
    }


    public emitRequestDesicion(desicion, index, chatId, data=[]){
        this.MessengerEvents[1]['desicion'] = desicion;
        this.MessengerEvents[1]['index'] = index;
        this.MessengerEvents[1]['chatId'] = chatId;
        this.MessengerEvents[1]['data'] = data;

        this.Manager.emit(this.MessengerEvents[1]);
    }

    
    public emitUpdateContact(title, chatId){

        this.MessengerEvents[2]['title'] = title; 
        this.MessengerEvents[2]['chatId'] = chatId; 



        this.Manager.emit(this.MessengerEvents[2]);
    }



    public subscribe(){
        this.Manager.subscribe(
            (data: any) => {
              return data;
            });
    }

    
}