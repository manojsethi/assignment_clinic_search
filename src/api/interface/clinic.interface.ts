export interface Clinic {
  name: string;
  state: string;
  availability: {
    from: string;
    to: string;
  };
}
