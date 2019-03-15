export interface IApiEndpoints {
  signUp: string;
  signIn: string;
  refreshAccessToken: string;
}

export interface IGdmnApiEndpoints extends IApiEndpoints {
  data: string;
  er: string;
  app: string;
  backup: string;
  downloadBackup: string;
  restoreBackup: string;
  uploadBackup: string;
  deleteBackup: string;
  ws: string;
}
