import { GenerationInput, IWebsiteGenerator } from "./generator.interface";
import { WebsiteBlueprint } from "../../types/blueprint";
import { RuleBasedGenerator } from "./rule-based.generator";

export class GenerationEngine {
  private generator: IWebsiteGenerator;

  constructor(generator?: IWebsiteGenerator) {
    // Inject the rule-based generator by default.
    // In the future, this is the ONLY line that changes to:
    // this.generator = generator || new AiGenerator();
    this.generator = generator || new RuleBasedGenerator();
  }

  async generateBlueprint(input: GenerationInput): Promise<WebsiteBlueprint> {
    return await this.generator.generate(input);
  }
}
