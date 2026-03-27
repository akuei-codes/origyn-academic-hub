interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-8 flex items-end justify-between animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl tracking-tight text-foreground lg:text-4xl">{title}</h1>
        {description && <p className="mt-2 text-muted-foreground">{description}</p>}
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>
  );
}
