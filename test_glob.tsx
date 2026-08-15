const modules = import.meta.glob('../../non-existent-config.json', { eager: true });
console.log(modules);
