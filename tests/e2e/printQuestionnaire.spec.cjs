const { test, expect } = require('@playwright/test')

for (const locale of [
    { code: 'it', title: 'Fotografia linguistica', family: 'nella mia famiglia si parla ...', shortFamily: 'Quali lingue vengono abitualmente utilizzate nella tua famiglia? (puoi indicare più di una risposta)', age: 'A quale età sei stato esposto alle lingue che conosci?' },
    { code: 'en', title: 'Linguistic Photography', family: 'In my family we speak ...', shortFamily: 'What languages are usually used in your family? (you can choose more than one answer)', age: 'At what age were you first exposed to the languages you know?' },
    { code: 'fu', title: 'Fotografie linguistiche', family: 'inte mê famee si fevele ...', shortFamily: 'Cualis lenghis si doprìno in mût abituâl te tô famee? (tu puedis segnâ plui di une rispueste)', age: 'A ce etât sêstu jentrât in contat cu lis lenghis che tu cognossis?' },
]) test(`printable questionnaire in ${locale.code}: localized full and short forms and blank age grid`, async ({ page }, testInfo) => {
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    for (const form of ['full', 'short']) {
        await page.goto(`/${locale.code}/p/print?form=${form}`)
        await expect(page.getByRole('heading', { name: locale.title, exact: true })).toBeVisible()
        await expect(page.getByRole('group', { name: form === 'full' ? locale.family : locale.shortFamily, exact: true })).toBeVisible()
        await expect(page.getByRole('group')).toHaveCount(form === 'full' ? 29 : 6)
        await expect(page.getByRole('group', { name: /ai miei familiari parlo in|i miei familiari a me parlano in/ })).toHaveCount(0)
        if (form === 'full') {
            const age = page.getByRole('group', { name: locale.age, exact: false })
            await expect(age.getByRole('radio').first()).toBeVisible()
            await page.emulateMedia({ media: 'print' })
            const radios = age.locator('input[type="radio"]')
            expect(await radios.count()).toBeGreaterThan(0)
            expect(await radios.evaluateAll(inputs => inputs.every(input => getComputedStyle(input).visibility === 'hidden'))).toBe(true)
            await expect(age.getByRole('table')).toBeVisible()
            await expect(age.getByRole('columnheader', { name: /0-3/ })).toBeVisible()
            await expect(page.getByRole('checkbox').first()).toBeVisible()
        } else {
            await expect(page.locator('.language-to-age')).toHaveCount(0)
        }
        await page.pdf({ path: testInfo.outputPath(`questionario-${form}-${locale.code}.pdf`), preferCSSPageSize: true })
        await page.emulateMedia({ media: 'screen' })
    }
    expect(errors).toEqual([])
})
