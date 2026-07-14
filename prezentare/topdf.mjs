import { chromium } from 'playwright';
const jobs=[["CalyHub-Prezentare-SALON.html","CalyHub-Prezentare-SALON.pdf"],
            ["CalyHub-Prezentare-CLIENT.html","CalyHub-Prezentare-CLIENT.pdf"]];
const browser=await chromium.launch({executablePath:'/opt/pw-browsers/chromium'});
const page=await browser.newPage();
for(const [html,pdf] of jobs){
  await page.goto('file://'+process.cwd()+'/'+html,{waitUntil:'networkidle'});
  await page.pdf({path:pdf,format:'A4',printBackground:true,margin:{top:'0',bottom:'0',left:'0',right:'0'}});
  console.log('done',pdf);
}
await browser.close();
