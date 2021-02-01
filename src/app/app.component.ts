import { Component } from '@angular/core'
import { BlobService, UploadConfig } from './modules/blob/blob.module'
import { Config } from './config.template'
import { BehaviorSubject, Observable } from 'rxjs';
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  config: UploadConfig
  filesSelected: File[];
  percent: number;

  filesObs: BehaviorSubject<Array<any>>
  
  constructor (private blobService: BlobService) {
    this.filesSelected = [];
    this.config = null;
    this.percent = 0;
    this.filesObs = new BehaviorSubject([]);
  }
  
  changeFiles(files) {
    this.filesSelected = Array.from(files);

    let filesUploading = this.filesSelected.map((file) => {
      if(file.type !== 'text/plain') {
        return {
          file: file,
          progress: 0,
          error: true
        }
      } else {
        return {
          file: file,
          progress: 0,
          error: false
        }
      }
    })

    console.log("F ",filesUploading)

    this.filesObs.next(filesUploading);
    
    filesUploading.forEach(file => {
      if(file.file.type == 'text/plain'){
        this.uploadService(file.file, (prog) => {
          file.progress = prog
          file.file.type
          console.log(file);
        })
      }
    })

  }

  changeNewFile(file, index){
    let newFileArray: File[];
    newFileArray = Array.from(file);
    console.log("INDEX",index);

    let fileUploading = newFileArray.map((file)=>{
      if(file.type !== 'text/plain') {
        return {
          file: file,
          progress: 0,
          error: true
        }
      } else {
        return {
          file: file,
          progress: 0,
          error: false
        }
      }
    })

    //this.filesObs.next(fileUploading);

    this.filesObs.pipe(take(1)).subscribe(val => {
      let valueObs = this.filesObs.getValue();
      valueObs.splice(index, 1)
      let newArr = [...valueObs, fileUploading]

      this.filesObs.next(newArr)
    })

    fileUploading.forEach(file => {
      if(file.file.type == 'text/plain'){
        this.uploadService(file.file, (prog) => {
          file.progress = prog
          file.file.type
          console.log(file);
        })
      }
    })
  }

  uploadService(xfile, cbk) {
      const baseUrl = this.blobService.generateBlobUrl(Config, xfile.name);

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
          //console.log(xfile)
          cbk(percent);
          this.percent = percent;
        }
      }
      
      this.blobService.uploadService(this.config);
  }
}
