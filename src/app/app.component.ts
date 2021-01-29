import { Component } from '@angular/core'
import { BlobService, UploadConfig } from './modules/blob/blob.module'
import { Config } from './config.template'
import { BehaviorSubject, Observable } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  config: UploadConfig
  currentFiles: File[] = [];
  percent: number;

  filesObs: BehaviorSubject<Array<any>>
  
  constructor (private blob: BlobService) {
    this.currentFiles = null
    this.config = null
    this.percent = 0;

    this.filesObs = new BehaviorSubject([]);
  }
  
  updateFiles (files) {
    this.currentFiles = Array.from(files);
    let filesUploading = this.currentFiles.map((file)=>{
      return {
        file: file,
        progress: 0,
        error: false
      }
    })

    this.filesObs.next(filesUploading);
    
    filesUploading.forEach(file => {
      this.upload(file.file, (e)=> {
        file.progress = e
        console.log(file.progress + ': ' + e);
      })
    })

  }

  upload (xfile, cb) {
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
          cb(percent);
          this.percent = percent;
        }
      }
      
      this.blob.upload(this.config);
      
    }
  }
}
