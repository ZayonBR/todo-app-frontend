import { Component, signal } from '@angular/core';
import { Tarefa } from "./tarefa";
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})

export class App {
  protected readonly title = signal('TODOapp');

  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL : string;

  constructor(private http: HttpClient) {
  this.apiURL = 'https://tarefas-zayon.onrender.com';
  this.READ_tarefas();
  } 

  CREATE_tarefa(descricaoNovaTarefa: string) {
    var novaTarefa = new Tarefa(descricaoNovaTarefa, false);
    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa).subscribe(
      (resultado : any) => { console.log(resultado); this.READ_tarefas(); });
  }

  READ_tarefas() {
    this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`).subscribe(
      (resultado : any) => this.arrayDeTarefas.set(resultado));
  }

  DELETE_tarefa(tarefaAserRemovida: Tarefa) {
    // Pega o ID diretamente do objeto recebido
    var id = tarefaAserRemovida._id; 
    
    this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${id}`).subscribe(
      (resultado : any) => { 
        console.log("Removido com sucesso:", resultado); 
        this.READ_tarefas(); 
      }
    );
  }

  UPDATE_tarefa(tarefaAserModificada: Tarefa) {
    // Mesma correção aqui para o Update não falhar pelo mesmo motivo!
    var id = tarefaAserModificada._id; 
    
    this.http.patch<Tarefa>(`${this.apiURL}/api/update/${id}`, tarefaAserModificada).subscribe(
      (resultado : any) => { 
        console.log("Atualizado com sucesso:", resultado); 
        this.READ_tarefas(); 
      }
    );
  }
}
