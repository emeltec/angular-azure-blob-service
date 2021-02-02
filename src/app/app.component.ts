import { Component } from '@angular/core'
import { BlobService, UploadConfig } from './modules/blob/blob.module'
import { Config } from './config.template'
import { BehaviorSubject } from 'rxjs';
import { take } from 'rxjs/operators'

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  config: UploadConfig;
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
      if(this.validateFileExtension(file) === 'INVALID') {
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

    this.filesObs.next(filesUploading);
    
    filesUploading.forEach(file => {
      if(this.validateFileExtension(file.file) === 'VALID'){
        this.uploadService(file.file, (prog) => {
          file.progress = prog;
          file.file.type;
          console.log(file);
        })
      }
    })

  }

  changeNewFile(file, index) {
    let newFileArray: File[];
    newFileArray = Array.from(file);

    let fileUploading = newFileArray.map((file) => {
      if(this.validateFileExtension(file) === 'INVALID') {
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
    
    this.filesObs.pipe(take(1)).subscribe(val => {
      if(val.length == 0){
        this.filesObs.next(fileUploading);
      } else {
        let valueObs = this.filesObs.getValue();
        valueObs.splice(index, 1, ...fileUploading)
        this.filesObs.next(valueObs);
      }
    })

    fileUploading.forEach(file => {
      if(this.validateFileExtension(file.file) === 'VALID') {
        this.uploadService(file.file, (prog) => {
          file.progress = prog;
          file.file.type;
          console.log(file);
        })
      }
    })
  }

  deleteFile(idx){
    this.filesObs.pipe(take(1)).subscribe( val => {
      let valueObs = this.filesObs.getValue();
        valueObs.splice(idx, 1);
        this.filesObs.next(valueObs);
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
          console.log('Transfer completed !');
        },
        error: (err) => {
          console.log('Error:', err);
        },
        progress: (percent) => {
          //console.log(xfile)
          cbk(percent);
          this.percent = percent;
        }
      }
      
      this.blobService.uploadService(this.config);
  }

  private validateFileExtension(file): string {
    const validExtensions = ['txt', 'csv'];
    const extension = file.name.split('.');
    const extFinal = extension[extension.length - 1].toLowerCase();

    if (validExtensions.indexOf(extFinal) < 0) {
      return 'INVALID';
    }
    return 'VALID';
  }
}
