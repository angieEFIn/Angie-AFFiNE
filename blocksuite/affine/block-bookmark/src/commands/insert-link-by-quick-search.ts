import type { InsertedLinkType } from '@blocksuite/affine-block-embed';
import { QuickSearchProvider } from '@blocksuite/affine-shared/services';
import type { Command } from '@blocksuite/block-std';

export const insertLinkByQuickSearchCommand: Command<
  never,
  'insertedLinkType'
> = (ctx, next) => {
  const { std } = ctx;
  const quickSearchService = std.getOptional(QuickSearchProvider);
  if (!quickSearchService) {
    next();
    return;
  }

  const insertedLinkType: Promise<InsertedLinkType> = quickSearchService
    .openQuickSearch()
    .then(result => {
      if (!result) return null;

      // add linked doc
      if ('docId' in result) {
        std.command.exec('insertEmbedLinkedDoc', {
          docId: result.docId,
          params: result.params,
        });
        return {
          flavour: 'affine:embed-linked-doc',
        };
      }

      // add normal link;
      if ('externalUrl' in result) {
        std.command.exec('insertBookmark', { url: result.externalUrl });
        return {
          flavour: 'affine:bookmark',
        };
      }

      return null;
    });

  next({ insertedLinkType });
};
