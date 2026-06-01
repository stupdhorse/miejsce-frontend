import {PipeTransform, Pipe} from "@angular/core"

export const API_URL = 'http://localhost';

@Pipe({
    name: 'imageUrl',
    standalone: true
})
export class ImageUrlPipe implements PipeTransform{
    transform(url: string | null | undefined): string {
        if(!url){
            return 'assets/placeholder.png'
        }
        if (url.startsWith('http') || url.startsWith('assets') || url.startsWith('data:image')) {
      return url;
    }
    return `${API_URL}${url}`;
    }
}