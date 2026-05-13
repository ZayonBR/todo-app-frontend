import { Component, signal, OnInit, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Tarefa } from "./tarefa";
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})

export class App implements OnInit {
  protected readonly title = signal('TODOapp');

  arrayDeTarefas = signal<Tarefa[]>([]);
  apiURL: string;
  usuarioLogado = signal(false);

  tokenJWT = '{ "token": "" }';
  novaPrioridade = signal<'Alta' | 'Média' | 'Baixa'>('Baixa');


  private platformId = inject(PLATFORM_ID);

  constructor(private http: HttpClient) {
    this.apiURL = 'https://tarefas-zayon.onrender.com';
  }

  roleUsuario = signal('');
  nomeUsuario = signal('');


  Login(username: string, password: string) {
    this.http.post(`${this.apiURL}/api/login`, { nome: username, senha: password })
      .subscribe((res: any) => {
        this.tokenJWT = JSON.stringify(res);
        this.roleUsuario.set(res.role);
        this.nomeUsuario.set(username);

        this.READ_tarefas();
      });
  }


  modoRegistro = signal(false);

  toggleModo() {
    this.modoRegistro.set(!this.modoRegistro());
  }

  Register(username: string, password: string) {
    const credenciais = { "nome": username, "senha": password };

    this.http.post(`${this.apiURL}/api/register`, credenciais).subscribe({
      next: () => {
        alert('Conta criada! Agora faça o login.');
        this.modoRegistro.set(false);
      }
    });
  }

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
    }
  }

  CREATE_tarefa(descricaoNovaTarefa: string) {
    if (!descricaoNovaTarefa.trim()) return;
    const novaTarefa = new Tarefa(descricaoNovaTarefa, false, this.novaPrioridade(), []);
    const token = JSON.parse(this.tokenJWT).token;

    this.http.post<Tarefa>(`${this.apiURL}/api/post`, novaTarefa, {
      headers: { 'id-token': token }
    }).subscribe(() => {
      this.READ_tarefas();
      this.novaPrioridade.set('Baixa');
    });
  }

  async READ_tarefas(retry = true): Promise<void> {
    try {
      const token = JSON.parse(this.tokenJWT).token;

      const resultado = await firstValueFrom(
        this.http.get<Tarefa[]>(`${this.apiURL}/api/getAll`, {
          headers: {
            'Cache-Control': 'no-cache',
            'id-token': token
          }
        })
      );

      this.arrayDeTarefas.set(resultado);
      this.usuarioLogado.set(true);

    } catch (erro) {
      console.error("Erro ao carregar tarefas:", erro);
      this.usuarioLogado.set(false);

      if (retry) {
        setTimeout(() => {
          this.READ_tarefas(false);
        }, 2000);
      }
    }
  }

  DELETE_tarefa(tarefa: Tarefa) {
    const token = JSON.parse(this.tokenJWT).token;

    this.http.delete<Tarefa>(`${this.apiURL}/api/delete/${tarefa._id}`, {
      headers: { 'id-token': token }
    }).subscribe(() => this.READ_tarefas());
  }

  UPDATE_tarefa(tarefa: Tarefa) {
    const token = JSON.parse(this.tokenJWT).token;

    this.http.patch<Tarefa>(
      `${this.apiURL}/api/update/${tarefa._id}`,
      tarefa,
      {
        headers: { 'id-token': token }
      }
    ).subscribe(() => this.READ_tarefas());
  }

  listaUsuarios = signal<any[]>([]);

  LISTAR_usuarios() {
    const token = JSON.parse(this.tokenJWT).token;
    this.http.get<any[]>(`${this.apiURL}/api/usuarios`, {
      headers: { 'id-token': token }
    }).subscribe({
      next: (res) => this.listaUsuarios.set(res),
      error: (err) => console.error('Erro ao listar:', err)
    });
  }

  PROMOVER_usuario(id: string) {
    const token = JSON.parse(this.tokenJWT).token;
    this.http.patch(`${this.apiURL}/api/usuario/promover/${id}`, {}, {
      headers: { 'id-token': token }
    }).subscribe({
      next: () => {
        alert('Usuário promovido!');
        this.LISTAR_usuarios();
      },
      error: (err) => alert('Erro: ' + err.error.message)
    });
  }

  DELETAR_usuario(id: string) {
    if (!confirm('Tem certeza que deseja remover este usuário?')) return;

    const token = JSON.parse(this.tokenJWT).token;
    this.http.delete(`${this.apiURL}/api/usuario/${id}`, {
      headers: { 'id-token': token }
    }).subscribe({
      next: () => {
        alert('Usuário removido!');
        this.LISTAR_usuarios();
      },
      error: (err) => alert('Erro ao deletar: ' + err.error.message)
    });
  }

  usuarioEditandoId = signal<string | null>(null);

  ATUALIZAR_usuario(id: string, novoNome: string, novaSenha?: string) {
    if (!novoNome.trim()) {
      alert('O nome não pode ser vazio!');
      return;
    }
    
    const body: any = { nome: novoNome };
    if (novaSenha && novaSenha.trim() !== '') {
      body.senha = novaSenha;
    }

    const token = JSON.parse(this.tokenJWT).token;
    this.http.patch(`${this.apiURL}/api/usuario/${id}`, body, {
      headers: { 'id-token': token }
    }).subscribe({
      next: () => {
        alert('Usuário atualizado com sucesso!');
        this.usuarioEditandoId.set(null);
        this.LISTAR_usuarios();
      },
      error: (err) => alert('Erro ao atualizar: ' + err.error.message)
    });
  }

  painelAdminAberto = signal(false);

  toggleAdminPainel() {
    this.painelAdminAberto.set(!this.painelAdminAberto());
    if (this.painelAdminAberto() && this.listaUsuarios().length === 0) {
      this.LISTAR_usuarios();
    }
  }

  tarefasFeitas() {
    return this.arrayDeTarefas().filter(t => t.statusRealizada).length;
  }
}
