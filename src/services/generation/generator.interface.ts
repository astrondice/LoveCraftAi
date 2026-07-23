import { WebsiteBlueprint } from "../../types/blueprint";

export interface GenerationInput {
  name1: string;
  name2: string;
  message: string;
  date: string;
  duration: string;
  memory: string;
  photos: { name: string; dataUrl: string }[];
  music: { name: string; dataUrl: string } | null;
  video: { name: string; dataUrl: string } | null;
  themeId: string;
}

export interface IWebsiteGenerator {
  generate(input: GenerationInput): Promise<WebsiteBlueprint>;
}
