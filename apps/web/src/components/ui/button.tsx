import * as React from "react";
import { cn } from "@/lib/utils";
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "secondary" | "destructive" };
export function Button({ className, variant = "default", ...props }: ButtonProps) { return <button className={cn("inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition disabled:opacity-50", variant === "default" && "bg-primary text-primary-foreground hover:opacity-90", variant === "secondary" && "bg-muted text-foreground hover:bg-muted/80", variant === "destructive" && "bg-destructive text-destructive-foreground", className)} {...props} />; }
