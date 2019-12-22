import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ChatwindowsService } from '../../services/chatwindows.service';
import { eventEmitterService } from '../../../../../providers/services/eventEmitter.service';


@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {

  @ViewChild("Messages", { read: ElementRef, static: false }) private Messages: ElementRef;
  @ViewChild("chatBody", { read: ElementRef, static: false }) private chatBody: ElementRef;


  constructor(public ChatWindows: ChatwindowsService, private events: eventEmitterService) {

    this.events.manager.subscribe(
      (data: any) => {

        if (data.task === 'requestmessage') {

          this.ChatWindows.Manager[0]['messages'][data.index].accepted = data.desicion;
          this.ChatWindows.Manager[0]['messages'][data.index].text = 'Kontakten er etablert';


          this.events.emitUpdateContact('Forespørsel godkjent', data.chatId);


        }


      });
  }

  ngOnInit() {
    this.scrollDownInChat()
  }

  scrollDownInChat() {
    try {

      this.chatBody.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

    } catch (error) {

    }
  }

  postRequestDesicion(index, recieverId, req, chatId) {


    var initial = (index === 0) ? true : false;

    const data = { type: 2, index: index, chatId: chatId, recieverId: recieverId, desicion: req, initial: initial };

    this.ChatWindows.api.post('comsocket', data, 'secure').subscribe(response => {

      console.log('desicion', data);
      console.log('res', response);

      this.events.emitRequestDesicion(req, index, chatId);

    });

    this.ChatWindows.Manager[0].accepted = req;

  }

}
