declare module './setting.json' { // 指定したいJSONファイルのpath
  type siteType = {
    domain: string,
    subDir: string[],
    viewportWidth: number[],
    authInfo: {
      user: string,
      pass: string
    } | undefined;
  }[]


  const sitesData: siteType;
  export = sitesData;
}