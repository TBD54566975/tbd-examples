<script setup lang="ts">
import { ReloadIcon } from '@radix-icons/vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { PersonIcon } from '@radix-icons/vue'
import { Button } from '@/components/ui/button'
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { toast } from '@/components/ui/toast/use-toast'
import { ref } from 'vue'

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters')
  })
)

const name = ref('')
const profileImage = ref('')
const fileInputKey = ref(0)

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = () => {
      profileImage.value = reader.result as string
    }
    reader.readAsDataURL(file)
  }
}

const clearImage = () => {
  profileImage.value = ''
  fileInputKey.value++
}

const { isFieldDirty, handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema
})

const onSubmit = handleSubmit((values) => {
  name.value = values.name
  toast({
    title: 'Success',
    description: `Form submitted successfully with name: ${values.name}`
  })
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1>Settings</h1>
    <form class="lg:w-1/3 w-full space-y-6" @submit.prevent="onSubmit">
      <img
        v-if="profileImage"
        :src="profileImage"
        alt="Profile Preview"
        class="w-24 h-24 rounded-xl"
      />
      <PersonIcon v-else class="w-24 h-24" />

      <FormField name="profileImage" class="w-full">
        <FormItem>
          <FormLabel>Profile Image</FormLabel>
          <FormControl>
            <div class="flex items-center gap-2">
              <Input
                type="file"
                accept="image/*"
                class="dark:bg-gray-700"
                @change="handleImageUpload"
                :key="fileInputKey"
              />
              <Button type="button" @click="clearImage" v-if="profileImage"> Clear Image </Button>
            </div>
          </FormControl>
          <FormDescription>Upload your profile image.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <FormField v-model="name" name="name" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Enter your name" v-model="name" />
          </FormControl>
          <FormDescription>This is your public display name.</FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>

      <Button type="submit" :disabled="isSubmitting">
        <ReloadIcon v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" /> Save
      </Button>
    </form>
  </div>
</template>
