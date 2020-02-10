import { Injectable, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';


@Injectable({
  providedIn: 'root'
})
export class messengerEvents {

    public manager = new EventEmitter<any>();
    private eventType:Array<any> = [];

    constructor(){
        this.eventType[0] = {task: 'newcontact', completion: false, data:[], 'remote':false}; 
        this.eventType[1] = {task: 'requestmessage', accepted: 2, data:[]}; 
        this.eventType[2] = {task: 'updatecontact', data:[]}; 
    }

    public emitNewContact(data, remote=false){
        this.eventType[0]['completion'] = true;
        this.eventType[0]['data'] = data;
        this.eventType[0]['remote'] = remote;

        this.manager.emit(this.eventType[0]);
    }


    public emitRequestDesicion(desicion, index, chatId, data=[]){
        this.eventType[1]['desicion'] = desicion;
        this.eventType[1]['index'] = index;
        this.eventType[1]['chatId'] = chatId;
        this.eventType[1]['data'] = data;

        this.manager.emit(this.eventType[1]);
    }

    
    public emitUpdateContact(title, chatId){

        this.eventType[2]['title'] = title; 
        this.eventType[2]['chatId'] = chatId; 



        this.manager.emit(this.eventType[2]);
    }



    public subscribe(){
        this.manager.subscribe(
            (data: any) => {
              return data;
            });
    }

    
}