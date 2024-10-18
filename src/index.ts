import { html, LitElement, css, TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import IntlMessageFormat, { FormatXMLElementFn } from 'intl-messageformat';
import { createIntl, createIntlCache } from '@formatjs/intl';
import enMessages from '../locales/en.json';
import frMessages from '../locales/fr.json';

type LanguageType = 'en' | 'fr';
// 初始化多语言数据
const messages = {
  en: enMessages,
  fr: frMessages,
};

// 创建缓存实例（可选，提升性能）
const cache = createIntlCache();

// 初始化国际化实例
let intl = createIntl(
  {
    locale: 'en',
    messages: messages['en'],
  },
  cache,
);

@customElement('my-app')
class MyApp extends LitElement {
  @property({ type: String })
  private language: string = 'en';

  @property({ type: String })
  private name: string = 'Alice';

  @property({ type: String })
  private place: string = 'Wonderland';

  static styles = css`
    :host {
      display: block;
      font-family: Arial, sans-serif;
      padding: 16px;
    }
    select {
      margin-bottom: 16px;
    }
  `;

  switchLanguage(lang: LanguageType) {
    this.language = lang;
  }

  updateIntl() {
    intl = createIntl(
      {
        locale: this.language,
        messages: messages[this.language],
      },
      cache,
    );
  }

  // 使用回调函数处理富文本插值
  renderMessage() {
    const message = intl.formatMessage(
      {
        id: 'greeting',
        defaultMessage: '<b>Hello</b>, {name}! Welcome to {place}!',
        description: 'Greeting to the user',
      },
      {
        b: (content) => html`<b>${content}</b>`,
        name: html`${this.name}`,
        place: html`${this.place}`,
      } as Record<string, any>, //TODO:: handle type error
    );
    return message;
  }

  private formatMessage(
    descriptor: { id: string; defaultMessage: string },
    values: Record<
      string,
      string | number | TemplateResult | FormatXMLElementFn<TemplateResult>
    > = {},
  ): string {
    const { defaultMessage } = descriptor;
    const messageFormatter = new IntlMessageFormat(defaultMessage, 'en');
    return messageFormatter.format(values) as string;
  }

  render() {
    this.updateIntl();
    const nameTemplate = html`<strong>${this.name}</strong>`;

    const message = this.formatMessage(
      { id: 'welcome', defaultMessage: '<b>Welcome</b>, {name}!' },
      { name: nameTemplate, b: (content) => html`<b>${content}</b>` },
    );

    return html`
      <div>
        <p>${message}</p>
        <p>${this.renderMessage()}</p>
        <button @click=${() => this.switchLanguage('fr')}>
          Switch to French
        </button>
        <button @click=${() => this.switchLanguage('en')}>
          Switch to English
        </button>
      </div>
    `;
  }
}
