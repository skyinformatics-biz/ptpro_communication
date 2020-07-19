import { Injectable, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { RestfulAPI } from '../../../../providers/services/RestfulAPI.service';


@Injectable({
    providedIn: 'root'
})
export class Events {

    public messenger = new MessengerEvents();
    public chatWindow = new ChatWindowEvents();


    constructor() {

       

    }

}

 /** Apply Chat Window Events to ChatWindowEvents  */
class ChatWindowEvents {

    public eventHandler = new EventEmitter<any>();

    constructor() {
    }

    /**
     * name
     */
    public newMessage(data) {
        data.task = 'newMessage';
        data.currentUser = true;
        data.type = 0;

        this.eventHandler.emit(data);
    }

    public requestMessageOption(value, index, chatId) {

    }

    public subscribe() {
        this.eventHandler.subscribe(
            (data: any) => {
                return data;
            });
    }

}
 /** MessengerEvent Class Array */
class MessengerEvents {

    public eventHandler = new EventEmitter<any>();
    private MessengerEvents: Array<any> = [];


    constructor() {
        /** Apply Messenger Events to MessengerEvents Array */
        this.MessengerEvents[0] = { task: 'newContact', completion: false, data: [], 'remote': false };
        this.MessengerEvents[1] = { task: 'requestMessage', accepted: 2, data: [] };
        this.MessengerEvents[2] = { task: 'updateContact', data: [] };
        this.MessengerEvents[3] = { task: 'newMessage', data: [] };
    }

    public newContact(data, remote = false) {
        this.MessengerEvents[0]['completion'] = true;
        this.MessengerEvents[0]['data'] = data;
        this.MessengerEvents[0]['remote'] = remote;

        this.eventHandler.emit(this.MessengerEvents[0]);
    }


    public requestDesicion(decision, index, chatId, data = []) {
        this.MessengerEvents[1]['decision'] = decision;
        this.MessengerEvents[1]['index'] = index;
        this.MessengerEvents[1]['chatId'] = chatId;
        this.MessengerEvents[1]['data'] = data;

        this.eventHandler.emit(this.MessengerEvents[1]);
    }


    public updateContact(index, value) {

        this.MessengerEvents[2]['index'] = index;
        this.MessengerEvents[2]['accepted'] = value;

        this.eventHandler.emit(this.MessengerEvents[2]);
    }

    public subscribe() {
        this.eventHandler.subscribe(
            (data: any) => {
                return data;
            });
    }
}