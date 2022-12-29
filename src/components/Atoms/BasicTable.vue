<template>
  <table
    width="100%"
    cellPadding="0"
  >
    <thead data-cy="table-header">
      <slot name="header" />
    </thead>
    <tbody data-cy="table-body">
      <slot name="body" />
    </tbody>
    <tfoot data-cy="table-foot">
      <slot name="foot" />
    </tfoot>
  </table>
</template>
