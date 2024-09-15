// src/utils.js
export function getStatusLabel(status) {
  switch (status) {
    case 1:
      return 'Aberto';
    case 2:
      return 'Em andamento';
    case 3:
      return 'Resolvido';
    case 4:
      return 'Cancelado';
    default:
      return 'Desconhecido';
  }
}
  
  export function getPriorityLabel(priority) {
    switch (priority) {
      case 1:
        return 'Baixa';
      case 2:
        return 'Média';
      case 3:
        return 'Alta';
      default:
        return 'Desconhecida';
    }
  }
  