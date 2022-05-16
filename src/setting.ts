export const domain: string = "http://lapraspica.com/"; //URL
export const subDir: string[] = [
  "",
  "about",
  "archives/plan",
  "archives/staffs",
  "archives/staff_blog",
  "contact",
]; //サブディレクトリ
export const viewportWidth: number[] = [375, 768, 1280, 1920]; //画面幅
export const authInfo: AuthType = { user: "shimaken5", pass: "Syouto9ta14" }; //Basic認証用のUSERとPASS

interface AuthType {
  user: string,
  pass: string
}

