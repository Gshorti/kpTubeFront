import {Component, inject, OnInit} from '@angular/core'
import {FormsModule} from "@angular/forms"
import {NgIf} from "@angular/common"
import {Router} from '@angular/router'
import {Subscription} from "rxjs"
import {HttpEvent, HttpEventType} from "@angular/common/http"
import {response} from "express"
import {MusicFetchService} from "../music-fetch.service"
import {VideosFetchService} from "../videos-fetch.service"

@Component({
  selector: 'app-music-creating',
  standalone: true,
  imports: [
    FormsModule,
    NgIf
  ],
  templateUrl: './music-creating.component.html',
  styleUrl: './music-creating.component.sass'
})
export class MusicCreatingComponent {
  MusicFetchService = inject(MusicFetchService)
  VideoFetchService = inject(VideosFetchService)

  selectedFile: File | null = null
  selectedPreview: File | null = null
  music_name: string = ''
  description: string = ''

  constructor(private MusicUploadService: MusicFetchService, VideosUploadService: VideosFetchService, private router: Router) {
  }

  mainLink = 'https://i.ibb.co/wBn5TrS/Loading-File-Img.png'

  audioSrc: string | ArrayBuffer | null = null
  loading: boolean = false
  isButtonDisabled: boolean = false
  uploadProgress = 0
  uploadSub: Subscription | null = null
  errorMessage: string | null = null
  nameLS: any | null = null
  ownerLS: any | null = null
  artist: any
  imageSrc: string | ArrayBuffer | null = null

  onFileChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0]
      const file = event.target.files[0]
      if (file && (file.type === 'audio/mp3') || (file.type === 'audio/mpeg')) { //mpeg
        const reader = new FileReader()
        reader.onload = () => {
          this.audioSrc = reader.result
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please select a audio. Your type === ' + file.type)
      }
    }
  }

  previewChange(event: any): void {
    if (event.target.files.length > 0) {
      this.selectedPreview = event.target.files[0]
      const file = event.target.files[0]
      if (file && file.type === 'picture/jpg' || file.type === 'image/jpeg') {
        const reader = new FileReader()
        reader.onload = () => {
          this.imageSrc = reader.result
        }
        reader.readAsDataURL(file)
      } else {
        alert('Please select a jpg or jpeg image.')
      }
    }
  }

  onSubmit(): void {
    const videoID = Number(new Date())
    console.log(videoID)

    if (typeof localStorage !== 'undefined') {
      this.nameLS = localStorage.getItem('UserName')
    }
    if (this.nameLS !== null) {
      this.getUserData()
    } else {
      this.errorMessage = 'Необходимо создать аккаунт!'
    }
  }

  getUserData() {
    this.VideoFetchService.enterUser(String(this.nameLS)).subscribe(
      userResponse => {
        if (userResponse[0].isEmailVerified === true) {
          this.loading = true
          if (typeof localStorage !== 'undefined') {
            this.ownerLS = String(localStorage.getItem('UserName'))
          }
          this.isButtonDisabled = true

          if (this.selectedFile && this.selectedPreview) {
            this.addNewMusic(this.selectedFile, this.selectedPreview)
          } else {
            this.errorMessage = 'Не выбран файл!'
          }
        } else {
          this.errorMessage = 'Необходимо верифицировать аккаунт'
        }
      }
    )
  }

  addNewMusic(selectedFile: File, selectedPreview: File) {
    this.uploadSub = this.MusicFetchService.addNewMusic(
      this.music_name,
      this.ownerLS,
      this.description,
      selectedFile,
      selectedPreview,
    ).subscribe((event: HttpEvent<any>) => {
      this.loading = false
      this.router.navigate(['/KPmusic'])
      this.isButtonDisabled = false
    }, (error: HttpEvent<any>) => {
      console.error(error)
      this.errorMessage = 'Ошибка сервера'
      this.loading = false
      this.isButtonDisabled = false
    })
  }

  cancelUpload() {
    if (this.uploadSub) {
      this.uploadSub.unsubscribe()
      this.loading = false
      this.isButtonDisabled = false
      console.log('Upload cancelled')
    }
  }

  close() {
    this.errorMessage = null
    this.router.navigate(['/'])
  }
}
