<script setup lang="ts">
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { PersonIcon, ReloadIcon } from '@radix-icons/vue'
import { useWeb5 } from '@/composables/web5'
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
import { ref, onBeforeMount } from 'vue'

const { createDisplayName, loadDisplayName, createAvatarImage, loadAvatarImage } = useWeb5()

onBeforeMount(() => {
  loadDisplayNameFromDRL()
  loadAvatarImageFromDRL()
})

const loadDisplayNameFromDRL = async () => {
  name.value = await loadDisplayName()
}

const loadAvatarImageFromDRL = async () => {
  profileImageSrc.value = await loadAvatarImage()
}

const formSchema = toTypedSchema(
  z.object({
    name: z.string().min(1, 'Name is required').max(50, 'Name must be less than 50 characters')
  })
)

const name = ref('')
const fileInputKey = ref(0)
const profileImageSrc = ref('')

const handleImageUpload = async (event: Event) => {
  try {
    isSubmitting.value = true
    const file = new Blob(event.currentTarget.files)
    if (file) {
      await createAvatarImage(file)
      profileImageSrc.value = URL.createObjectURL(file)
      toast({
        title: 'Success',
        description: `profile image updated`
      })
    }
  } finally {
    isSubmitting.value = false
  }
}

const clearImage = () => {
  profileImageSrc.value = ''
  fileInputKey.value++
}

const { isFieldDirty, handleSubmit, isSubmitting } = useForm({
  validationSchema: formSchema
})

const onSubmit = handleSubmit(async (values) => {
  await createDisplayName(values.name)
  name.value = values.name
  toast({
    title: 'Success',
    description: `profile updated`
  })
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1>Settings</h1>

    <h2>Profile Settings</h2>
    <form class="lg:w-1/3 w-full space-y-6" @submit.prevent="onSubmit">
      <img
        v-if="profileImageSrc"
        :src="profileImageSrc"
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
              <Button type="button" @click="clearImage" v-if="profileImageSrc">Clear Image</Button>
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
        <ReloadIcon v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" />
        <span v-else>Save</span>
      </Button>
    </form>
  </div>
</template>
