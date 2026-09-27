<template>
  <div class="comment-thread">
    <article class="comment-node is-root">
      <div class="comment-avatar" aria-hidden="true">
        <img v-if="comment.authorAvatar" :src="comment.authorAvatar" :alt="comment.author" />
        <span v-else>{{ avatarText(comment.author) }}</span>
      </div>
      <div class="comment-main">
        <div class="comment-author">
          <strong>{{ comment.author }}</strong>
        </div>
        <p class="comment-content">{{ comment.content }}</p>
        <div class="comment-actions">
          <span>{{ formatDate(comment.createdAt) }}</span>
          <button type="button" :class="{ active: replyTargetId === comment.id }" @click="$emit('reply', comment)">{{ replyTargetId === comment.id ? '取消回复' : '回复' }}</button>
          <button type="button" @click="$emit('report', comment)">举报</button>
        </div>
        <div v-if="replyTargetId === comment.id" class="inline-reply-editor">
          <textarea :value="replyContent" maxlength="2000" :placeholder="`回复${comment.author}...`" autofocus @input="updateReplyContent" />
          <div class="inline-reply-footer">
            <span>{{ replyContent.length }} / 2000</span>
            <button type="button" :disabled="submitting || !replyContent.trim()" @click="$emit('submit-reply')">{{ submitting ? '提交中' : '回复' }}</button>
          </div>
        </div>
      </div>
    </article>
    <div v-if="flatReplies.length" class="comment-replies">
      <article v-for="reply in flatReplies" :key="reply.id" class="comment-node is-reply">
        <div class="comment-avatar" aria-hidden="true">
          <img v-if="reply.authorAvatar" :src="reply.authorAvatar" :alt="reply.author" />
          <span v-else>{{ avatarText(reply.author) }}</span>
        </div>
        <div class="comment-main">
          <div class="comment-author">
            <strong>{{ reply.author }}</strong
            ><span>回复</span><em>{{ reply.replyToAuthor }}</em>
          </div>
          <p class="comment-content">{{ reply.content }}</p>
          <div class="comment-actions">
            <span>{{ formatDate(reply.createdAt) }}</span>
            <button type="button" :class="{ active: replyTargetId === reply.id }" @click="$emit('reply', reply)">{{ replyTargetId === reply.id ? '取消回复' : '回复' }}</button>
            <button type="button" @click="$emit('report', reply)">举报</button>
          </div>
          <div v-if="replyTargetId === reply.id" class="inline-reply-editor">
            <textarea :value="replyContent" maxlength="2000" :placeholder="`回复${reply.author}...`" autofocus @input="updateReplyContent" />
            <div class="inline-reply-footer">
              <span>{{ replyContent.length }} / 2000</span>
              <button type="button" :disabled="submitting || !replyContent.trim()" @click="$emit('submit-reply')">{{ submitting ? '提交中' : '回复' }}</button>
            </div>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue';
import type { CmsComment } from '../../api/cms';

type CommentNode = CmsComment & { children?: CommentNode[] };
type FlatReply = CommentNode & { replyToAuthor: string };
const props = withDefaults(defineProps<{ comment: CommentNode; replyTargetId?: string; replyContent?: string; submitting?: boolean }>(), {
  replyTargetId: '',
  replyContent: '',
  submitting: false,
});
const emit = defineEmits<{
  'reply': [comment: CmsComment];
  'report': [comment: CmsComment];
  'update:replyContent': [content: string];
  'submit-reply': [];
}>();
const avatarText = (author: string) => author.trim().slice(0, 1).toUpperCase() || '访';
const formatDate = (value: string) => value?.replace('T', ' ').slice(0, 16) ?? '';
const flatReplies = computed<FlatReply[]>(() => {
  const result: FlatReply[] = [];
  const append = (nodes: CommentNode[], parentAuthor: string) => {
    for (const node of nodes) {
      result.push({ ...node, replyToAuthor: parentAuthor });
      append(node.children ?? [], node.author);
    }
  };
  append(props.comment.children ?? [], props.comment.author);
  return result;
});
const updateReplyContent = (event: Event) => emit('update:replyContent', (event.target as HTMLTextAreaElement).value);
</script>
