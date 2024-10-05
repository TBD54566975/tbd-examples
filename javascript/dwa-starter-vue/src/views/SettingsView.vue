<script setup lang="ts">
import { ReloadIcon } from '@radix-icons/vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'

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

const name = ref('John Doe')

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
      <FormField v-model="name" name="name" :validate-on-blur="!isFieldDirty">
        <FormItem>
          <FormLabel>Name</FormLabel>
          <FormControl>
            <Input type="text" placeholder="Enter your name" v-model="name" />
          </FormControl>
          <FormDescription> This is your public display name. </FormDescription>
          <FormMessage />
        </FormItem>
      </FormField>
      <Button type="submit" :disabled="isSubmitting">
        <ReloadIcon v-if="isSubmitting" class="w-4 h-4 mr-2 animate-spin" /> Save
      </Button>
    </form>
  </div>
</template>
