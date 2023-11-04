import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class VisionService {
  private apiKey = 'AIzaSyDFEOcRrEZaXUn96uGjRQlotIK8Q8I1OF0'; // Reemplaza con tu clave de API de Google

  private apiUrl = 'https://vision.googleapis.com/v1/images:annotate?key=';

  constructor(private http: HttpClient) {}

  detectObjects(imageData: string): Observable<any> {
    const requestPayload = {
      requests: [
        {
          image: {
            content: imageData,
          },
          features: [
            {
              type: 'LABEL_DETECTION', // Puedes ajustar los tipos de características según tus necesidades
              maxResults: 5,
            },
          ],
        },
      ],
    };

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + this.apiKey,
    });

    return this.http.post(this.apiUrl + this.apiKey, requestPayload, {
      headers: headers,
    });
  }
}
