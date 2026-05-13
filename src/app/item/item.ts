import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Tarefa, SubTarefa } from "../tarefa";

@Component({
  selector: 'app-item',
  standalone: false,
  templateUrl: './item.html',
  styleUrl: './item.css',
})
export class Item {
  emEdicao = false;
  expandido = false;

  @Input() tarefa: Tarefa = new Tarefa("", false, "Baixa", []);

  @Output() remover = new EventEmitter<Tarefa>();
  @Output() modificaTarefa = new EventEmitter();

  onRemover() {
    this.remover.emit(this.tarefa);
  }

  toggleExpandir(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'INPUT' && target.tagName !== 'BUTTON' && !target.classList.contains('btn-icon')) {
       this.expandido = !this.expandido;
    }
  }

  addSubTarefa(descricao: string) {
    if (!descricao.trim()) return;
    if (!this.tarefa.subTarefas) this.tarefa.subTarefas = [];
    this.tarefa.subTarefas.push({ descricao, statusRealizada: false });
    this.modificaTarefa.emit();
  }

  toggleSubTarefa(index: number) {
    this.tarefa.subTarefas[index].statusRealizada = !this.tarefa.subTarefas[index].statusRealizada;
    this.modificaTarefa.emit();
  }

  removerSubTarefa(index: number) {
    this.tarefa.subTarefas.splice(index, 1);
    this.modificaTarefa.emit();
  }
}
