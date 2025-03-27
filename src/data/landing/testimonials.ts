export interface Testimonial {
  id: string;
  content: string;
  author: string;
  location: string;
  rating: number;
}

export const testimonials: Testimonial[] = [
  {
    id: "1",
    content: "Początkowo byłam sceptyczna, ale horoskopy od Twojej Przepowiedni okazały się zdumiewająco trafne! Przewidziały ważne zmiany w moim życiu zawodowym, które rzeczywiście nastąpiły miesiąc później. Jestem pod ogromnym wrażeniem!",
    author: "Anna K.",
    location: "Warszawa",
    rating: 5
  },
  {
    id: "2",
    content: "To co najbardziej cenię w Twojej Przepowiedni to personalizacja. Nie są to ogólnikowe horoskopy, jakie czytałem wcześniej, ale naprawdę dopasowane do mojej sytuacji życiowej. Polecam każdemu, kto szuka prawdziwego wglądu!",
    author: "Marek W.",
    location: "Kraków",
    rating: 5
  }
];
