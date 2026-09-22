const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

function getBase64Image(fileName) {
    try {
        const filePath = path.join(__dirname, fileName);
        const bitmap = fs.readFileSync(filePath);
        return `data:image/png;base64,${Buffer.from(bitmap).toString('base64')}`;
    } catch (error) {
        console.warn(`⚠️ Aviso: Não consegui carregar o arquivo ${fileName}.`);
        return '';
    }
}

async function generateCarousel() {
    const content = JSON.parse(fs.readFileSync(path.join(__dirname, 'content.json'), 'utf8'));
    const htmlTemplate = fs.readFileSync(path.join(__dirname, 'template.html'), 'utf8');

    const logoDarkBase64 = getBase64Image('logo-dark.png');
    const logoLightBase64 = getBase64Image('logo-light.png');
    const personalPhotoBase64 = getBase64Image('minha-foto.png');

    let slidesHtml = '';
    const totalSlides = content.slides.length;

    content.slides.forEach((slide, index) => {
        const theme = slide.theme || 'dark';
        let layoutClasses = `theme-${theme}`;
        let photoHtml = '';

        if (slide.photo_position && personalPhotoBase64) {
            const isRight = slide.photo_position.includes('right');
            const positionClass = `photo-${slide.photo_position}`;
            layoutClasses += isRight ? ' has-photo-right' : ' has-photo-left';

            const scaleFactor = Number(slide.scale) || 1;
            const computedWidth = Math.min(70, Math.max(38, 42 + (scaleFactor - 1) * 8));
            const widthStyle = slide.scale ? `style="width: ${computedWidth}%;"` : '';
            const flipClass = slide.flip ? ' flip-horizontal' : '';

            photoHtml = `
            <div class="photo-wrapper ${positionClass}" ${widthStyle}>
                <img src="${personalPhotoBase64}" class="personal-photo photo-shadow${flipClass}" alt="Foto Érky" />
            </div>`;
        }

        const currentPage = index + 1;
        const currentLogoBase64 = theme === 'dark' ? logoLightBase64 : logoDarkBase64;
        const logoHtml = currentLogoBase64
            ? `<img src="${currentLogoBase64}" class="logo-placeholder" alt="Logo Érky" />`
            : '<div style="color: red; font-size: 20px;">[Logo]</div>';

        slidesHtml += `
        <div class="slide ${layoutClasses}">
            ${photoHtml}

            <div class="content-wrapper">
                ${slide.tag ? `<div class="tag">${slide.tag}</div>` : ''}
                <h1>${slide.title}</h1>
                ${slide.content ? `<p>${slide.content}</p>` : ''}
            </div>

            <div class="footer">
                ${logoHtml}
                <div class="page-indicator">${currentPage} / ${totalSlides}</div>
            </div>
        </div>
        `;
    });

    const finalHtml = htmlTemplate.replace('<!-- O JS irá injetar os slides aqui -->', slidesHtml);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--allow-file-access-from-files']
    });
    const page = await browser.newPage();

    await page.setContent(finalHtml, { waitUntil: 'networkidle0' });

    await page.pdf({
        path: path.join(__dirname, 'Carrossel_Impacto.pdf'),
        width: '1080px',
        height: '1350px',
        printBackground: true,
        pageRanges: ''
    });

    await browser.close();
    console.log('✅ Sucesso! Carrossel_Impacto.pdf gerado.');
}

generateCarousel().catch(console.error);
