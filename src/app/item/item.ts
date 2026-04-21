import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tarefa } from '../tarefa';

@Component({
  selector: 'app-item',
  standalone: false,
  templateUrl: './item.html',
  styleUrl: './item.css',
})
export class Item {
emEdicao = false;
@Input() tarefa: Tarefa = new Tarefa("", false);
@Output() clear = new EventEmitter();
@Output() removeTarefa = new EventEmitter();
@Output() modificaTarefa = new EventEmitter();
}