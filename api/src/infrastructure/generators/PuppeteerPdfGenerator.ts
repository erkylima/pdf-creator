import puppeteer, { Browser, Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { PdfGeneratorPort } from '../../domain/ports/PdfGeneratorPort';
import { PdfConfig } from '../../domain/models/PdfConfig';

export class PuppeteerPdfGenerator implements PdfGeneratorPort {
  private readonly assetsPath: string;
  private readonly templatePath: string;

  constructor() {
    this.assetsPath = path.join(process.cwd(), '../shared/assets');
    this.templatePath = path.join(__dirname, '../../templates/template.html');
  }

  async generate(config: PdfConfig): Promise<Buffer> {
    const browser = await this.launchBrowser();
    try {
      const page = await this.createPage(browser, config);
      return await page.pdf({
        width: '1080px',
        height: '1350px',
        printBackground: true,
        pageRanges: ''
      });
    } finally {
      await browser.close();
    }
  }

  async preview(config: PdfConfig): Promise<Buffer[]> {
    const browser = await this.launchBrowser();
    try {
      const page = await this.createPage(browser, config);
      const slides = await page.$$('.slide');
      const previews: Buffer[] = [];
      for (const slide of slides) {
        previews.push(await slide.screenshot({ type: 'png' }));
      }
      return previews;
    } finally {
      await browser.close();
    }
  }

  private async launchBrowser(): Promise<Browser> {
    return puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--allow-file-access-from-files']
    });
  }

  private async createPage(browser: Browser, config: PdfConfig): Promise<Page> {
    const content = config.content;
    const htmlTemplate = fs.readFileSync(this.templatePath, 'utf8');

    const logoDarkBase64 = this.getBase64Image('logo-dark.png');
    const logoLightBase64 = this.getBase64Image('logo-light.png');
    const uploadedPhotos = config.photos || [config.photo || null];

    let slidesHtml = '';
    const totalSlides = content.slides.length;

    content.slides.forEach((slide, index) => {
      const theme = slide.theme === 'light' || slide.theme === 'gold' ? slide.theme : 'dark';
      let layoutClasses = `theme-${theme}`;
      let photoHtml = '';
      const personalPhotoBase64 = slide.photo_id
        ? uploadedPhotos[slide.photo_id - 1] || this.getBase64Image('minha-foto.png')
        : uploadedPhotos.find((photo): photo is string => Boolean(photo))
          || this.getBase64Image('minha-foto.png');

      if (slide.photo_position && personalPhotoBase64) {
        const isRight = slide.photo_position === 'bottom-right';
        const isLeft = slide.photo_position === 'bottom-left';
        const positionClass = `photo-${slide.photo_position}`;
        if (isRight) layoutClasses += ' has-photo-right';
        if (isLeft) layoutClasses += ' has-photo-left';

        const scaleFactor = Number(slide.scale) || 1;
        const computedWidth = Math.min(70, Math.max(38, 42 + (scaleFactor - 1) * 8));
        const widthStyle = slide.scale ? `style="width: ${computedWidth}%;"` : '';
        const flipClass = slide.photo_flip ? ' flip-horizontal' : '';

        photoHtml = `
        <div class="photo-wrapper ${positionClass}" ${widthStyle}>
            <img src="${personalPhotoBase64}" class="personal-photo photo-shadow${flipClass}" alt="Foto Pessoal" />
        </div>`;
      }

      const currentPage = index + 1;
      const currentLogoBase64 = theme === 'dark' ? logoLightBase64 : logoDarkBase64;
      const shouldHideLogo = Boolean(slide.hidden_logo);
      const logoHtml = shouldHideLogo
        ? '<div class="logo-placeholder hidden-logo" aria-hidden="true"></div>'
        : (currentLogoBase64
          ? `<img src="${currentLogoBase64}" class="logo-placeholder" alt="Logo" />`
          : '<div style="color: red; font-size: 20px;">[Logo]</div>');
      const tagHtml = slide.tag ? `<div class="tag">${this.escapeHtml(slide.tag)}</div>` : '';
      const titleHtml = `<h1>${this.escapeHtml(slide.title)}</h1>`;
      const contentHtml = slide.content
        ? `<p>${this.escapeHtml(slide.content).replace(/\n/g, '<br>')}</p>`
        : '';
      const cardsHtml = (slide.cards || []).length > 0
        ? `<div class="content-cards">${slide.cards!.map((card) => `
              <div class="content-subcard">
                  <strong>${this.escapeHtml(card.title)}</strong>
                  ${card.content ? `<span>${this.escapeHtml(card.content)}</span>` : ''}
              </div>
          `).join('')}</div>`
        : '';
      const regularContentHtml = `
          <div class="content-wrapper">
              ${tagHtml}
              ${titleHtml}
              ${contentHtml}
          </div>`;
      const structuredContentHtml = `
          <div class="content-wrapper structured-layout${slide.cards_enabled ? ' has-content-cards' : ''}">
              <div class="slide-heading">
                  ${tagHtml}
                  ${titleHtml}
              </div>
              ${slide.cards_enabled
                ? `<div class="slide-content-card">${contentHtml}${cardsHtml}</div>`
                : (contentHtml ? `<div class="structured-slide-copy">${contentHtml}</div>` : '')}
          </div>`;
      const contentMarkup = slide.cards_enabled || slide.photo_position === 'center'
        ? structuredContentHtml
        : regularContentHtml;

      slidesHtml += `
      <div class="slide ${layoutClasses}${slide.cards_enabled ? ' has-content-cards' : ''}${slide.photo_position === 'center' ? ' has-centered-photo' : ''}">
          ${photoHtml}
          ${contentMarkup}

          <div class="footer">
              ${logoHtml}
              <div class="page-indicator">${currentPage} / ${totalSlides}</div>
          </div>
      </div>
      `;
    });

    const finalHtml = htmlTemplate.replace('<!-- O JS irá injetar os slides aqui -->', slidesHtml);
    const page = await browser.newPage();
    await page.setViewport({
      width: 1080,
      height: 1350,
      deviceScaleFactor: 1,
    });
    await page.emulateMediaType('print');
    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });
    return page;
  }

  private getBase64Image(fileName: string): string {
    try {
      const filePath = path.join(this.assetsPath, fileName);
      const bitmap = fs.readFileSync(filePath);
      return `data:image/png;base64,${Buffer.from(bitmap).toString('base64')}`;
    } catch (error) {
      console.warn(`⚠️ Aviso: Não consegui carregar o arquivo ${fileName}.`);
      return '';
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}
