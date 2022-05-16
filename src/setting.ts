export const domain: string = ""; //URL
export const subDir: string[] = [
  "",
  "contact"
]; //サブディレクトリ
export const viewportWidth: number[] = [375, 768, 1280, 1920]; //画面幅
export const authInfo: AuthType = { user: "", pass: "" }; //Basic認証用のUSERとPASS

interface AuthType {
  user: string,
  pass: string
}

