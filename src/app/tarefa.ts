export interface SubTarefa {
  _id?: string;
  descricao: string;
  statusRealizada: boolean;
}

export class Tarefa {
    _id: string | undefined;
    descricao: string;
    statusRealizada: boolean;
    prioridade: 'Alta' | 'Média' | 'Baixa';
    subTarefas: SubTarefa[];

    constructor(_descricao: string, _statusRealizada: boolean, _prioridade: 'Alta' | 'Média' | 'Baixa' = 'Baixa', _subTarefas: SubTarefa[] = []) {
        this.descricao = _descricao;
        this.statusRealizada = _statusRealizada;
        this.prioridade = _prioridade;
        this.subTarefas = _subTarefas;
    }
}
