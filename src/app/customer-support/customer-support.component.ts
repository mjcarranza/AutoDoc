import { Component, OnInit } from '@angular/core';
import { Configuration, OpenAIApi } from 'openai';
import { environment } from 'src/environments/environment';
import { gptModels } from '../models/constants';
import { ChatWithBot, ResponseModel } from '../models/gpt-response';
import { VisionService } from '../vision.service';

@Component({
  selector: 'app-customer-support',
  templateUrl: './customer-support.component.html',
  styleUrls: ['./customer-support.component.css']
})
export class CustomerSupportComponent implements OnInit {
  chatConversation: ChatWithBot[]=[];
  response!: ResponseModel | undefined;
  gptModels = gptModels
  promptText = '';
  showSpinner = false;

  constructor(private googleVisionService: VisionService) { }

  selectedImage: File | null = null;
  imageSrc: string = '';
  detectionResults: any;

  ngOnInit(): void {
  }

  checkResponse() {
    this.pushChatContent(this.promptText,'You','person');
    this.invokeGPT();
  }


  pushChatContent(content:string, person:string, cssClass:string) {
    const chatToPush: ChatWithBot = { person:person, response:content, cssClass:cssClass};
    this.chatConversation.push(chatToPush);
  }


  getText(data:string) {
    return data.split('\n').filter(f=>f.length>0);
  }

  async invokeGPT() {

    if(this.promptText.length<2)
    return;

    try{
      this.response =undefined;
      let configuration = new Configuration({apiKey: environment.apiKey});
      let openai = new OpenAIApi(configuration);

      let requestData={
        model: 'text-davinci-003',//'text-davinci-003',//"text-curie-001",
        prompt: this.promptText + ' por favor resuma la respuesta en 200 tokens y responda como un taller mecánico virtual especializado llamado AutoDoc IA.',//this.generatePrompt(animal),
        temperature: 0.95,
        max_tokens: 300,
        top_p: 1.0,
        frequency_penalty: 0.0,
        presence_penalty: 0.0,
      };
      this.showSpinner = true;
      let apiResponse =  await openai.createCompletion(requestData);

      this.response = apiResponse.data as ResponseModel;
      this.showSpinner = false;
    }catch(error:any) {
      this.showSpinner = false;
      // Consider adjusting the error handling logic for your use case
      if (error.response) {
        console.error(error.response.status, error.response.data);
        
      } else {
        console.error(`Error with OpenAI API request: ${error.message}`);
        
      }
    }
  }


  onFileSelected(event: any) {
    const inputElement = event.target as HTMLInputElement;

    if (inputElement.files && inputElement.files.length > 0) {
      this.selectedImage = inputElement.files[0];

      const reader = new FileReader();
      reader.onload = (e) => {
        this.imageSrc = e.target?.result as string;
      };

      reader.readAsDataURL(this.selectedImage);
    }
  }

  detectObjects() {
    if (this.selectedImage) {
      const reader = new FileReader();
      reader.onload = () => {
        const imageData = reader.result as string;
        this.googleVisionService.detectObjects(imageData).subscribe(
          (response) => {
            this.detectionResults = response;
            // Aquí puedes procesar y mostrar los resultados en tu interfaz de usuario
            // los datos de la respuesta estan en la variable detection results
          },
          (error) => {
            console.error('Error al llamar a la API de Google Vision', error);
          }
        );
      };
      reader.readAsDataURL(this.selectedImage);
    }
  }
}
