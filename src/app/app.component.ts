import { Component } from '@angular/core'
import { BlobService, UploadConfig } from './modules/blob/blob.module'
import { Config } from './config.template'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  config: UploadConfig
  currentFiles: File[] = [];
  percent: number
  
  constructor (private blob: BlobService) {
    this.currentFiles = null
    this.config = null
    this.percent = 0
  }
  
  updateFiles (files) {
    this.currentFiles = Array.from(files)

    this.currentFiles.forEach(file => {
      this.upload(file)
    })
  }

  upload (xfile) {

    //this.currentFiles.forEach(xfile => {


    if (xfile !== null) {
      const baseUrl = this.blob.generateBlobUrl(Config, xfile.name);

      this.config = {
        baseUrl: baseUrl,
        blockSize: 1024 * 32,
        sasToken: Config.sas,
        file: xfile,
        complete: () => {
          console.log('Transfer completed !')
        },
        error: (err) => {
          console.log('Error:', err)
        },
        progress: (percent) => {
          console.log("PERCENT", percent)
          this.percent = percent
        }
      }
      
      this.blob.upload(this.config);
      
    }

  //})


  }
}
