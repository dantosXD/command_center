<script lang="ts">
  import {
    Button,
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    Input,
    Label,
    Textarea,
    Select,
    Checkbox,
    Badge,
    Alert,
    AlertTitle,
    AlertDescription,
    Progress,
    Separator,
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
    Skeleton,
    Dialog,
    DialogHeader,
    DialogTitle,
    DialogContent,
    DialogFooter,
  } from '$lib/components/ui';
  import { AlertCircle, CheckCircle, Info } from 'lucide-svelte';

  let showDialog = $state(false);
  let checkboxValue = $state(false);
  let tabValue = $state('tab1');
  let inputValue = $state('');
  let textareaValue = $state('');
  let selectValue = $state('');
</script>

<div class="container mx-auto py-8 space-y-8">
  <div class="space-y-2">
    <h1 class="text-4xl font-bold">UI Component Showcase</h1>
    <p class="text-muted-foreground">
      A comprehensive display of the Command Center UI system components
    </p>
  </div>

  <Separator />

  <!-- Buttons -->
  <Card>
    <CardHeader>
      <CardTitle>Buttons</CardTitle>
      <CardDescription>Various button styles and sizes</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-4">
        <Button>Default</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
        <Button variant="link">Link</Button>
        <Button variant="destructive">Destructive</Button>
        <Button variant="success">Success</Button>
      </div>
      <div class="flex flex-wrap gap-4 mt-4">
        <Button size="sm">Small</Button>
        <Button size="default">Default</Button>
        <Button size="lg">Large</Button>
        <Button size="icon">🎨</Button>
      </div>
      <div class="flex flex-wrap gap-4 mt-4">
        <Button disabled>Disabled</Button>
      </div>
    </CardContent>
  </Card>

  <!-- Form Inputs -->
  <Card>
    <CardHeader>
      <CardTitle>Form Inputs</CardTitle>
      <CardDescription>Text inputs, textareas, and selects</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label for="input-demo" required>Input Field</Label>
          <Input id="input-demo" placeholder="Enter text here..." bind:value={inputValue} />
        </div>
        <div class="space-y-2">
          <Label for="textarea-demo">Textarea</Label>
          <Textarea id="textarea-demo" placeholder="Enter longer text..." bind:value={textareaValue} />
        </div>
        <div class="space-y-2">
          <Label for="select-demo">Select</Label>
          <Select id="select-demo" bind:value={selectValue}>
            <option value="">Choose an option...</option>
            <option value="option1">Option 1</option>
            <option value="option2">Option 2</option>
            <option value="option3">Option 3</option>
          </Select>
        </div>
        <div class="flex items-center space-x-2">
          <Checkbox id="checkbox-demo" bind:checked={checkboxValue} />
          <Label for="checkbox-demo">Accept terms and conditions</Label>
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Badges -->
  <Card>
    <CardHeader>
      <CardTitle>Badges</CardTitle>
      <CardDescription>Status indicators and labels</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="flex flex-wrap gap-2">
        <Badge>Default</Badge>
        <Badge variant="secondary">Secondary</Badge>
        <Badge variant="outline">Outline</Badge>
        <Badge variant="destructive">Destructive</Badge>
        <Badge variant="success">Success</Badge>
        <Badge variant="warning">Warning</Badge>
      </div>
    </CardContent>
  </Card>

  <!-- Alerts -->
  <Card>
    <CardHeader>
      <CardTitle>Alerts</CardTitle>
      <CardDescription>Informational messages and notifications</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <Alert>
          <Info class="h-4 w-4" />
          <AlertTitle>Info</AlertTitle>
          <AlertDescription>This is an informational alert message.</AlertDescription>
        </Alert>
        <Alert variant="success">
          <CheckCircle class="h-4 w-4" />
          <AlertTitle>Success</AlertTitle>
          <AlertDescription>Your action was completed successfully!</AlertDescription>
        </Alert>
        <Alert variant="warning">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>Please review this warning before proceeding.</AlertDescription>
        </Alert>
        <Alert variant="destructive">
          <AlertCircle class="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>Something went wrong. Please try again.</AlertDescription>
        </Alert>
      </div>
    </CardContent>
  </Card>

  <!-- Progress -->
  <Card>
    <CardHeader>
      <CardTitle>Progress</CardTitle>
      <CardDescription>Progress indicators</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div class="space-y-2">
          <Label>25% Complete</Label>
          <Progress value={25} />
        </div>
        <div class="space-y-2">
          <Label>50% Complete</Label>
          <Progress value={50} />
        </div>
        <div class="space-y-2">
          <Label>75% Complete</Label>
          <Progress value={75} />
        </div>
      </div>
    </CardContent>
  </Card>

  <!-- Tabs -->
  <Card>
    <CardHeader>
      <CardTitle>Tabs</CardTitle>
      <CardDescription>Tabbed content navigation</CardDescription>
    </CardHeader>
    <CardContent>
      <Tabs bind:value={tabValue}>
        <TabsList>
          <TabsTrigger value="tab1">Tab 1</TabsTrigger>
          <TabsTrigger value="tab2">Tab 2</TabsTrigger>
          <TabsTrigger value="tab3">Tab 3</TabsTrigger>
        </TabsList>
        <TabsContent value="tab1">
          <p class="text-sm text-muted-foreground">Content for tab 1</p>
        </TabsContent>
        <TabsContent value="tab2">
          <p class="text-sm text-muted-foreground">Content for tab 2</p>
        </TabsContent>
        <TabsContent value="tab3">
          <p class="text-sm text-muted-foreground">Content for tab 3</p>
        </TabsContent>
      </Tabs>
    </CardContent>
  </Card>

  <!-- Dialog -->
  <Card>
    <CardHeader>
      <CardTitle>Dialog</CardTitle>
      <CardDescription>Modal dialogs and overlays</CardDescription>
    </CardHeader>
    <CardContent>
      <Button onclick={() => (showDialog = true)}>Open Dialog</Button>

      <Dialog bind:open={showDialog}>
        <DialogHeader>
          <DialogTitle>Dialog Title</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p class="text-sm text-muted-foreground">
            This is a dialog example. You can put any content here.
          </p>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" onclick={() => (showDialog = false)}>Cancel</Button>
          <Button onclick={() => (showDialog = false)}>Confirm</Button>
        </DialogFooter>
      </Dialog>
    </CardContent>
  </Card>

  <!-- Skeleton -->
  <Card>
    <CardHeader>
      <CardTitle>Skeleton Loaders</CardTitle>
      <CardDescription>Loading state placeholders</CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <Skeleton class="h-12 w-full" />
        <Skeleton class="h-32 w-full" />
        <div class="flex space-x-4">
          <Skeleton class="h-12 w-12 rounded-full" />
          <div class="space-y-2 flex-1">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
</div>
