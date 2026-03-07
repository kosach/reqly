import { test, expect } from '@playwright/test'

test.describe('Reqly Desktop App', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the app title', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Reqly')
  })

  test('should create a new collection', async ({ page }) => {
    // Click the "New Collection" button
    await page.click('button:has-text("New Collection")')

    // Enter collection name
    await page.fill('input[placeholder="Collection name"]', 'Test Collection')

    // Click create button
    await page.click('button:has-text("Create")')

    // Verify collection appears in the sidebar
    await expect(page.locator('text=Test Collection')).toBeVisible()
  })

  test('should create a request in a collection', async ({ page }) => {
    // Create a collection first
    await page.click('button:has-text("New Collection")')
    await page.fill('input[placeholder="Collection name"]', 'API Tests')
    await page.click('button:has-text("Create")')

    // Expand the collection
    await page.click('text=API Tests')

    // Create a new request
    await page.click('button:has-text("New Request")')
    await page.fill('input[placeholder="Request name"]', 'Get Users')
    await page.click('button:has-text("Create")')

    // Verify request appears in the collection
    await expect(page.locator('text=Get Users')).toBeVisible()
  })

  test('should send an HTTP request', async ({ page }) => {
    // Create collection and request
    await page.click('button:has-text("New Collection")')
    await page.fill('input[placeholder="Collection name"]', 'HTTP Tests')
    await page.click('button:has-text("Create")')
    await page.click('text=HTTP Tests')
    await page.click('button:has-text("New Request")')
    await page.fill('input[placeholder="Request name"]', 'Test Request')
    await page.click('button:has-text("Create")')

    // Select the request
    await page.click('text=Test Request')

    // Enter URL
    await page.fill('input[placeholder*="api.example.com"]', 'https://httpbin.org/get')

    // Send request
    await page.click('button:has-text("Send")')

    // Wait for response
    await page.waitForSelector('text=/Status:/')

    // Verify response status is visible
    await expect(page.locator('text=/200/')).toBeVisible({ timeout: 10000 })
  })

  test('should add headers to a request', async ({ page }) => {
    // Create collection and request
    await page.click('button:has-text("New Collection")')
    await page.fill('input[placeholder="Collection name"]', 'Header Tests')
    await page.click('button:has-text("Create")')
    await page.click('text=Header Tests')
    await page.click('button:has-text("New Request")')
    await page.fill('input[placeholder="Request name"]', 'With Headers')
    await page.click('button:has-text("Create")')

    // Select the request
    await page.click('text=With Headers')

    // Click Headers tab (should be active by default, but let's be explicit)
    await page.click('button:has-text("Headers")')

    // Add a header
    await page.click('button:has-text("Add Header")')
    
    // Find the first header input and fill it
    const headerInputs = page.locator('input[placeholder="Header name"]')
    await headerInputs.first().fill('Content-Type')
    
    const valueInputs = page.locator('input[placeholder="Header value"]')
    await valueInputs.first().fill('application/json')

    // Verify header inputs are filled
    await expect(headerInputs.first()).toHaveValue('Content-Type')
    await expect(valueInputs.first()).toHaveValue('application/json')
  })

  test('should switch between tabs in request builder', async ({ page }) => {
    // Create collection and request
    await page.click('button:has-text("New Collection")')
    await page.fill('input[placeholder="Collection name"]', 'Tab Tests')
    await page.click('button:has-text("Create")')
    await page.click('text=Tab Tests')
    await page.click('button:has-text("New Request")')
    await page.fill('input[placeholder="Request name"]', 'Tab Request')
    await page.click('button:has-text("Create")')

    // Select the request
    await page.click('text=Tab Request')

    // Verify Headers tab is active
    const headersTab = page.locator('button:has-text("Headers")')
    await expect(headersTab).toHaveClass(/text-primary-600/)

    // Click Body tab
    await page.click('button:has-text("Body")')

    // Verify Body tab is now active
    const bodyTab = page.locator('button:has-text("Body")')
    await expect(bodyTab).toHaveClass(/text-primary-600/)
  })

  test('should create and select an environment', async ({ page }) => {
    // Click the environment selector
    await page.click('text=/Environment:/')

    // Click "+ New" to create environment
    await page.click('text=+ New')

    // Enter environment name
    await page.fill('input[placeholder="Environment name"]', 'Development')

    // Click Create
    await page.click('button:has-text("Create")')

    // Verify environment is in the dropdown
    const envSelector = page.locator('select')
    await expect(envSelector).toHaveValue(/.+/) // Should have a value (the environment ID)
  })

  test('should delete a collection', async ({ page }) => {
    // Create a collection
    await page.click('button:has-text("New Collection")')
    await page.fill('input[placeholder="Collection name"]', 'To Delete')
    await page.click('button:has-text("Create")')

    // Find and click the delete button (×)
    const collectionRow = page.locator('text=To Delete').locator('..')
    await collectionRow.locator('button').last().click()

    // Confirm deletion in the dialog
    page.on('dialog', dialog => dialog.accept())

    // Verify collection is removed
    await expect(page.locator('text=To Delete')).not.toBeVisible({ timeout: 2000 })
  })
})
